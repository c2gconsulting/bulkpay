import _ from 'underscore';


let ReportUtils = {}

ReportUtils.getPayTypeHeadersAndTotal = function(employeePayments) {
    let payTypeHeaders = ['Employee']
    let payTypesTotal = ['Total']

    let tenantId = Core.getTenantId(Meteor.userId())
    let tenant = Tenants.findOne(tenantId)

    let netPayInDiffCurrencies = []
    let netPayTotalsInDiffCurrencies = []
            
    employeePayments.forEach(anEmployeeData => {
        anEmployeeData.payment.forEach(anEmployeePayType => {
            if(anEmployeePayType.id) {
                let doesPayTypeHeaderExist = _.find(payTypeHeaders, function(aPayType) {
                    return aPayType.id && (aPayType.id === anEmployeePayType.id)
                })
                if(!doesPayTypeHeaderExist) {
                    payTypeHeaders.push({
                        id: anEmployeePayType.id,
                        description: anEmployeePayType.description
                    })
                }
                //--
                let payTypeTotal = _.find(payTypesTotal, function(aPayType) {
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
                    if(anEmployeePayType.reference === 'Standard') {
                        let foundNetPayHeader = _.find(netPayInDiffCurrencies, aHeader => {
                            return aHeader.id === 'NetPay_' + tenant.baseCurrency.iso
                        })
                        if(!foundNetPayHeader) {
                            netPayInDiffCurrencies.push({
                                id: 'NetPay_' + tenant.baseCurrency.iso,
                                description: 'NetPay (' + tenant.baseCurrency.iso + ')'
                            })
                            netPayTotalsInDiffCurrencies.push({
                                id: 'NetPay_' + tenant.baseCurrency.iso,
                                total: anEmployeePayType.amountPC
                            })
                        } else {
                            let payTypeTotal = _.find(netPayTotalsInDiffCurrencies, function(aPayType) {
                                return aPayType.id === 'NetPay_' + tenant.baseCurrency.iso
                            })
                            if(payTypeTotal) {
                                payTypeTotal.total += anEmployeePayType.amountPC
                            }
                        }
                    } else if(anEmployeePayType.reference.startsWith('Standard_')) {
                        let currency = anEmployeePayType.reference.substring('Standard_'.length)

                        let foundNetPayHeader = _.find(netPayInDiffCurrencies, aHeader => {
                            return aHeader.id === 'NetPay_' + currency
                        })
                        if(!foundNetPayHeader) {
                            netPayInDiffCurrencies.push({
                                id: 'NetPay_' + currency,
                                description: 'NetPay (' + currency + ')'
                            })
                            netPayTotalsInDiffCurrencies.push({
                                id: 'NetPay_' + currency,
                                total: anEmployeePayType.amountPC
                            })
                        } else {
                            let payTypeTotal = _.find(netPayTotalsInDiffCurrencies, function(aPayType) {
                                return aPayType.id === 'NetPay_' + currency
                            })
                            if(payTypeTotal) {
                                payTypeTotal.total += anEmployeePayType.amountPC
                            }
                        }
                    }
                }
            }
        })
    })

    payTypeHeaders = payTypeHeaders.concat(netPayInDiffCurrencies)
    payTypesTotal = payTypesTotal.concat(netPayTotalsInDiffCurrencies)

    return {payTypeHeaders, payTypesTotal}
}

ReportUtils.getPayTypeValues = function(employeePayments, payTypeHeaders) {
    let payTypeValues = []
    
    let tenantId = Core.getTenantId(Meteor.userId())
    let tenant = Tenants.findOne(tenantId)

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
                let paytypeHeaderId = aPaytypeHeader.id

                if(paytypeHeaderId.indexOf('NetPay_') === 0) {
                    let currency = paytypeHeaderId.substring('NetPay_'.length)

                    if(currency && currency.length > 0) {
                        if(aPayType.reference === 'Standard') {
                            return currency === tenant.baseCurrency.iso
                        } else if(aPayType.reference.startsWith('Standard_')) {
                            let paytypeReferenceCurrency = aPayType.reference.substring('Standard_'.length) || ''
                            return paytypeReferenceCurrency === currency
                        }
                    }
                } else {
                    return (aPayType.id && (aPaytypeHeader.id === aPayType.id))
                }
            })
            if(doesPayTypeExist) {
                aRowOfPayTypeValues.push(doesPayTypeExist.amountPC)
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
                unitName: aTimeDatum.unitDetails ? aTimeDatum.unitDetails.unitName : '',
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

            if(payRunResults && payRunResults.length > 0){
                let payTypeHeadersAndTotal = ReportUtils.getPayTypeHeadersAndTotal(payRunResults) // paytypeId -> {total -> (value) }
                // console.log(`Paytype Headers and Total: ${JSON.stringify(payTypeHeadersAndTotal)}`)

                let formattedHeader = payTypeHeadersAndTotal.payTypeHeaders.map(aHeader => {
                    return aHeader.description || aHeader
                })
                // console.log(`formattedHeader: `, formattedHeader)
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
                day: {$gte: startDate, $lte: endDate}
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
                day: {$gte: startDate, $lte: endDate}
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
    },
    'reports/procurement': function(businessId, startDate, endDate, selectedEmployees) {
        check(businessId, String)
        this.unblock()
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let queryObj = {
                businessUnitId: businessId, 
                createdAt: {$gte: startDate, $lte: endDate}
            }
            if(selectedEmployees && selectedEmployees.length > 0) {                
                queryObj.createdBy = {$in: selectedEmployees}
            }
            let procurements = ProcurementRequisitions.find(queryObj).fetch();

            let biffedUpProcurements = procurements.map(aProcurement => {
                let employee = Meteor.users.findOne({_id: aProcurement.createdBy})
                if(employee) {
                    aProcurement.createdByFullName = employee.profile.fullName
                }
                //--
                let unit = EntityObjects.findOne({_id: aProcurement.unitId})
                if(unit) {
                    aProcurement.unitName = unit.name
                }
                return aProcurement
            })
            return biffedUpProcurements
        }
    },
    'reports/leaveRequests': function(businessId, startDate, endDate, selectedEmployees) {
        check(businessId, String)
        this.unblock()
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let queryObj = {
                businessId: businessId, 
                createdAt: {$gte: startDate, $lte: endDate}
            }
            if(selectedEmployees && selectedEmployees.length > 0) {                
                queryObj.employeeId = {$in: selectedEmployees}
            }
            let leavesRequestsCreated = Leaves.find(queryObj).fetch();

            let biffedUpLeaveRequests = leavesRequestsCreated.map(aLeave => {
                let employee = Meteor.users.findOne({_id: aLeave.employeeId})
                if(employee) {
                    aLeave.createdByFullName = employee.profile.fullName
                }
                //--
                // let unit = EntityObjects.findOne({_id: aLeave.unitId})
                // if(unit) {
                //     aLeave.unitName = unit.name
                // }
                return aLeave
            })
            // console.log(`biffedUpLeaveRequests: `, biffedUpLeaveRequests)

            return biffedUpLeaveRequests
        }
    },
    'reports/travelRequest': function(businessId, startDate, endDate, selectedEmployees) {
        check(businessId, String)
        this.unblock()
        //--
        if(Core.hasPayrollAccess(this.userid)) {
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let queryObj = {
                businessId: businessId, 
                createdAt: {$gte: startDate, $lte: endDate}
            }
            if(selectedEmployees && selectedEmployees.length > 0) {                
                queryObj.createdBy = {$in: selectedEmployees}
            }
            let travelRequests = TravelRequisitions.find(queryObj).fetch();

            let biffedUpTravelRequests = travelRequests.map(aTravelRequest => {
                let employee = Meteor.users.findOne({_id: aTravelRequest.createdBy})
                if(employee) {
                    aTravelRequest.createdByFullName = employee.profile.fullName
                }
                //--
                let unit = EntityObjects.findOne({_id: aTravelRequest.unitId})
                if(unit) {
                    aTravelRequest.unitName = unit.name
                }
                return aTravelRequest
            })
            return biffedUpTravelRequests
        }
    },
    'reports/employees': function(findCriteria) {
        check(findCriteria.businessIds, String)
        this.unblock()
        
        return Meteor.users.find(findCriteria).fetch()
    }
})
