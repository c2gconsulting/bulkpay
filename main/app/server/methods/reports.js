import _ from 'underscore';


let Utils = {}

Utils.getPayTypeHeadersAndTotal = function(employeePayments) {
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

Utils.getPayTypeValues = function(employeePayments, payTypeHeaders) {
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
                let payTypeHeadersAndTotal = Utils.getPayTypeHeadersAndTotal(payRunResults) // paytypeId -> {total -> (value) }
                //console.log(`Paytype Headers and Total: ${JSON.stringify(payTypeHeadersAndTotal)}`)

                let formattedHeader = payTypeHeadersAndTotal.payTypeHeaders.map(aHeader => {
                    return aHeader.description || aHeader
                })
                //--
                let reportData = Utils.getPayTypeValues(payRunResults, payTypeHeadersAndTotal.payTypeHeaders)

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
        check(businessId, String);
        //--
        console.log(`startDate: ${JSON.stringify(startDate)}`)
        console.log(`endDate: ${JSON.stringify(endDate)}`)

        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let timesForProject = Times.find({
                businessId: businessId, 
                project: {$exists : true},
                startTime: {$gte: startDate},
                endTime: {$lt: endDate}
            }).fetch();
            console.log(`timesForProject: ${JSON.stringify(timesForProject)}`)

            let biffedUpTimes = timesForProject.map(aTime => {
                let projectEmployee = Meteor.users.findOne({_id: aTime.employeeId})
                if(projectEmployee) {
                    aTime.employee = {}
                    _.extend(aTime.employee, projectEmployee)
                }
                //--
                let project = Projects.findOne({_id: aTime.project})
                if(project) {
                    _.extend(aTime.project, project)
                }
                //--
                let activity = Activities.findOne({_id: aTime.activity})
                if(activity) {
                    _.extend(aTime.activity, activity)
                }
                return aTime
            })
            console.log(`biffUpTimes: ${JSON.stringify(biffedUpTimes)}`)

            return biffedUpTimes
        }
    }
})
