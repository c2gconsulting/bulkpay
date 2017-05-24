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

    let giveMeGoodLookingDate = function(date) {
        return moment(date).format('DD MMM YYYY')
    }

    timeReportDataFromDb.forEach(aTimeDatum => {
        let projectInReportData = _.find(reportData, aProject => {
            return aProject.project === aTimeDatum.project
        })

        if(!projectInReportData) {// New project - New employee - New time
            let employeeTimeTotal = parseFloat(aTimeDatum.duration)
            if(isNaN(employeeTimeTotal)) {
                employeeTimeTotal = 0
            }
            reportData.push({
                project: aTimeDatum.project,
                projectName: aTimeDatum.projectDetails.projectName,
                employees: [{
                    employeeDetails: aTimeDatum.employeeDetails, 
                    days: [{
                        day: giveMeGoodLookingDate(aTimeDatum.day), duration: aTimeDatum.duration
                    }],
                    employeeTimeTotal: employeeTimeTotal
                }],
                projectTotalHours: employeeTimeTotal
            })
        } else {
            let projectEmployeesSoFar = projectInReportData.employees
            let foundEmployeeDataIndex = -1
            let foundEmployeeData = _.find(projectEmployeesSoFar, (anEmployeeData, employeeIndex) => {
                if(anEmployeeData.employeeDetails._id === aTimeDatum.employeeId) {
                    foundEmployeeDataIndex = employeeIndex
                    return true
                } 
            })
            if(foundEmployeeData) {// Same project - Same employee - New time
                foundEmployeeData.days.push({
                    day: giveMeGoodLookingDate(aTimeDatum.day), duration: aTimeDatum.duration
                })
                foundEmployeeData.employeeTimeTotal += aTimeDatum.duration
            } else {// Same project - New employee for project - New time
                let employeeTimeTotal = parseFloat(aTimeDatum.duration)
                if(isNaN(employeeTimeTotal)) {
                    employeeTimeTotal = 0
                }
                projectInReportData.employees.push({
                    employeeDetails: aTimeDatum.employeeDetails, 
                    days: [{
                        day: giveMeGoodLookingDate(aTimeDatum.day), 
                        duration: aTimeDatum.duration
                    }],
                    employeeTimeTotal: employeeTimeTotal
                })
            }
            projectInReportData.projectTotalHours += aTimeDatum.duration
        }
    })
    // console.log(`reportData`, JSON.stringify(reportData))
    return reportData
}

ReportUtils.processedReportDataForUnits = function(timeReportDataFromDb) {
    let reportData = []

    let giveMeGoodLookingDate = function(date) {
        return moment(date).format('DD MMM YYYY')
    }

    timeReportDataFromDb.forEach(aTimeDatum => {
        let unitInReportData = _.find(reportData, aUnit => {
            return aUnit.unit === aTimeDatum.costCenter
        })

        if(!unitInReportData) {// New unit - New employee - New time
            let employeeTimeTotal = parseFloat(aTimeDatum.duration)
            if(isNaN(employeeTimeTotal)) {
                employeeTimeTotal = 0
            }
            reportData.push({
                unit: aTimeDatum.costCenter,
                unitName: aTimeDatum.unitDetails.unitName,
                employees: [{
                    employeeDetails: aTimeDatum.employeeDetails, 
                    employeeTimeTotal: employeeTimeTotal
                }],
                unitTotalHours: employeeTimeTotal
            })
        } else {
            let unitEmployeesSoFar = unitInReportData.employees
            let foundEmployeeData = _.find(unitEmployeesSoFar, (anEmployeeData) => {
                if(anEmployeeData.employeeDetails._id === aTimeDatum.employeeId) {
                    return true
                } 
            })
            if(foundEmployeeData) {// Same unit - Same employee - New time
                foundEmployeeData.employeeTimeTotal += aTimeDatum.duration
            } else {// Same unit - New employee for unit - New time
                let employeeTimeTotal = parseFloat(aTimeDatum.duration)
                if(isNaN(employeeTimeTotal)) {
                    employeeTimeTotal = 0
                }
                unitInReportData.employees.push({
                    employeeDetails: aTimeDatum.employeeDetails, 
                    employeeTimeTotal: employeeTimeTotal
                })
            }
            unitInReportData.unitTotalHours += aTimeDatum.duration
        }
    })
    // console.log(`reportData`, JSON.stringify(reportData))
    return reportData
}



/**
 *  Payruns Methods
 */
Meteor.methods({
    'reports/getComprehensivePayResult': function(businessId, period) {
        check(period, String);
        check(businessId, String);
        this.unblock()
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
    'reports/timesForEveryoneByProject': function(businessId, startDate, endDate, selectedEmployees) {
        check(businessId, String)
        this.unblock()
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let queryObj = {
                businessId: businessId, 
                project: {$exists : true},
                day: {$gte: startDate, $lt: endDate}
            }
            if(selectedEmployees && selectedEmployees.length > 0) {                
                queryObj.employeeId = {$in: selectedEmployees}
            }
            let timesForProject = TimeWritings.find(queryObj).fetch();

            let biffedUpTimes = timesForProject.map(aTime => {
                let projectEmployee = Meteor.users.findOne({_id: aTime.employeeId})
                if(projectEmployee) {
                    aTime.employeeDetails = {}
                    let employeeDetails = {
                        _id: projectEmployee._id,
                        fullName: projectEmployee.profile.fullName,
                        employmentCode: projectEmployee.employeeProfile.employeeId
                    }
                    _.extend(aTime.employeeDetails, employeeDetails)
                }
                //--
                let project = Projects.findOne({_id: aTime.project})
                if(project) {
                    aTime.projectDetails = {}
                    let projectDetails = {
                        _id: project._id,
                        projectName: project.name,
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
            //console.log(`biffUpTimes: ${JSON.stringify(biffedUpTimes)}`)

            return ReportUtils.processedReportDataForProjects(biffedUpTimes)
        }
    },

    'reports/timesForEveryoneByUnit': function(businessId, startDate, endDate, selectedEmployees) {
        check(businessId, String)
        this.unblock()
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let queryObj = {
                businessId: businessId, 
                costCenter: {$exists : true},
                day: {$gte: startDate, $lt: endDate}
            }
            if(selectedEmployees && selectedEmployees.length > 0) {                
                queryObj.employeeId = {$in: selectedEmployees}
            }
            let timesForUnit = TimeWritings.find(queryObj).fetch();

            let biffedUpTimes = timesForUnit.map(aTime => {
                let employee = Meteor.users.findOne({_id: aTime.employeeId})
                if(employee) {
                    aTime.employeeDetails = {}
                    let employeeDetails = {
                        _id: employee._id,
                        fullName: employee.profile.fullName,
                        employmentCode: employee.employeeProfile.employeeId
                    }
                    _.extend(aTime.employeeDetails, employeeDetails)
                }
                //--
                let unit = EntityObjects.findOne({_id: aTime.costCenter})
                if(unit) {
                    aTime.unitDetails = {}
                    let unitDetails = {
                        _id: unit._id,
                        unitName: unit.name,
                    }
                    _.extend(aTime.unitDetails, unitDetails)
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
            // console.log(`biffUpTimes: ${JSON.stringify(biffedUpTimes)}`)

            return ReportUtils.processedReportDataForUnits(biffedUpTimes)
        }
    }    
})
