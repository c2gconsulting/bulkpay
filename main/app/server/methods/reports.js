import _ from 'underscore';


let ReportUtils = {}

ReportUtils.getPayTypeHeadersAndTotal = function(employeePayments) {
    let payTypeHeaders = ['Employee']
    let payTypesTotal = ['Total']

    employeePayments.forEach(anEmployeeData => {
        anEmployeeData.payment.forEach(anEmployeePayType => {
            if(anEmployeePayType.id) {
                let doesPayTypeHeaderExist = _.find(payTypeHeaders, function(aPayType) {
                    return aPayType.id && (aPayType.id === anEmployeePayType.id)
                })
                if(!doesPayTypeHeaderExist) {
                    payTypeHeaders.push({
                        id: anEmployeePayType.id,
                        // description: anEmployeePayType.description + `-${anEmployeePayType.id}`
                        description: anEmployeePayType.description
                    })
                }
                //--
                let payTypeTotal = _.find(payTypesTotal, function(aPayType, aPayTypeTotalIndex) {
                    return aPayType.id && (aPayType.id === anEmployeePayType.id)
                })
                if(payTypeTotal) {
                    payTypeTotal.total = payTypeTotal.total + anEmployeePayType.amountLC
                } else {
                    payTypesTotal.push({
                        id: anEmployeePayType.id,
                        total: anEmployeePayType.amountLC
                    })
                }
            } else {
                if(anEmployeePayType.code === 'NMP') {
                    let payTypeTotal = _.find(payTypesTotal, function(aPayType) {
                        return aPayType.id === 'NMP'
                    })
                    if(payTypeTotal) {
                        payTypeTotal.total = payTypeTotal.total + anEmployeePayType.amountLC
                    } else {
                        payTypesTotal.push({
                            id: 'NMP',
                            total: anEmployeePayType.amountLC
                        })
                    }
                }
            }
        })
    })
    payTypeHeaders.push('Net Pay')

    return {payTypeHeaders, payTypesTotal}
}

ReportUtils.getPayTypeValues = function(employeePayments, payTypeHeaders) {
    let payTypeValues = []

    employeePayments.forEach(anEmployeeData => {
        let aRowOfPayTypeValues = []

        payTypeHeaders.forEach(aPaytypeHeader => {
            if(aPaytypeHeader === 'Employee') {
                let employee = Meteor.users.findOne({_id: anEmployeeData.employeeId});
                aRowOfPayTypeValues.push(employee.profile.fullName)
                return
            }
            //--
            let doesPayTypeExist = _.find(anEmployeeData.payment, function(aPayType) {
                return aPayType.id && (aPaytypeHeader.id === aPayType.id)
            })
            if(doesPayTypeExist) {
                aRowOfPayTypeValues.push(doesPayTypeExist.amountLC)
            } else if(aPaytypeHeader === 'Net Pay') {
                let netPay = _.find(anEmployeeData.payment, function(aPayType) {
                    return (aPayType.code === 'NMP')
                })
                if(netPay) {
                    aRowOfPayTypeValues.push(netPay.amountLC)
                } else {
                    //console.log(`Employee payrun result doesn't have netpay. How can.`)
                }
            } else {
                aRowOfPayTypeValues.push("----")
            }
        })
        payTypeValues.push(aRowOfPayTypeValues)
    })
    return payTypeValues
}

ReportUtils.processedReportDataForProjects = function(timeReportDataFromDb) {
    let reportData = []

    timeReportDataFromDb.forEach(aTimeDatum => {
        let projectInReportData = _.find(reportData, aProject => {
            aProject.project = aTimeDatum.project
        })
        let timeDatumCopy = {...aTimeDatum}
        if(!projectInReportData) {
            reportData.push({
                project: aTimeDatum.project,
                projectName: aTimeDatum.projectDetails.projectName,
                employees: [{...aTimeDatum.employeeDetails, days: [aTimeDatum.day]}],
            })
        } else {
            let projectEmployeesSoFar = projectInReportData.employees
            let foundEmployeeData = _.find(projectEmployeesSoFar, anEmployee => {
                return anEmployee._id === aTimeDatum.employeeId
            })
            let emloyeeProjectDaysInPeriod = foundEmployeeData.days

        }
    })
    console.log(`reportData`, reportData)
    return reportData
}


/**
 *  Payruns Methods
 */
Meteor.methods({
    'reports/getComprehensivePayResult': (businessId, period) => {
        check(period, String);
        check(businessId, String);
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            const payRunResults =  Payruns.find({businessId: businessId, period: period}).fetch();
            console.log(`payRunResults: ${JSON.stringify(payRunResults)}`)

            if(payRunResults && payRunResults.length > 0){
                //console.log(`Result: ${JSON.stringify(payRunResults)}`)
                let payTypeHeadersAndTotal = ReportUtils.getPayTypeHeadersAndTotal(payRunResults) // paytypeId -> {total -> (value) }
                //console.log(`Paytype Headers and Total: ${JSON.stringify(payTypeHeadersAndTotal)}`)

                let formattedHeader = payTypeHeadersAndTotal.payTypeHeaders.map(aHeader => {
                    return aHeader.description || aHeader
                })
                //--
                let reportData = ReportUtils.getPayTypeValues(payRunResults, payTypeHeadersAndTotal.payTypeHeaders)

                reportData.push(payTypeHeadersAndTotal.payTypesTotal.map(aColumnToTotals => {
                    return (aColumnToTotals.total || aColumnToTotals)
                }))
                return {fields: formattedHeader, data: reportData};
            } else {
                return null
            }
        }
    },
    'reports/timesForEveryoneByProject': function(businessId, startDate, endDate) {
        check(businessId, String)
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let timesForProject = TimeWritings.find({
                businessId: businessId, 
                project: {$exists : true},
                day: {$gte: startDate},
                day: {$lt: endDate}
            }).fetch();
            console.log(`timesForProject number: ${JSON.stringify(timesForProject.length)}`)

            let biffedUpTimes = timesForProject.map(aTime => {
                let projectEmployee = Meteor.users.findOne({_id: aTime.employeeId})
                if(projectEmployee) {
                    aTime.employeeDetails = {}
                    let employeeDetails = {
                        fullName: projectEmployee.profile.fullName,
                        _id: projectEmployee._id,
                        employmentCode: projectEmployee.employeeProfile.employeeId
                    }
                    _.extend(aTime.employeeDetails, employeeDetails)
                }
                //--
                let project = Projects.findOne({_id: aTime.project})
                if(project) {
                    aTime.projectDetails = {}
                    let projectDetails = {
                        projectName: project.name,
                        _id: project._id
                    }
                    _.extend(aTime.projectDetails, projectDetails)
                }
                //--
                let activity = Activities.findOne({_id: aTime.activity})
                if(activity) {
                    aTime.activityDetails = {}
                    let activityDetails = {
                        activityName: activity.description
                    }
                    _.extend(aTime.activityDetails, activityDetails)
                }
                return aTime
            })
            console.log(`biffUpTimes: ${JSON.stringify(biffedUpTimes)}`)

            return ReportUtils.processedReportDataForProjects(biffedUpTimes)
        }
    }
})
