import _ from 'underscore';


let ReportUtils = {}

ReportUtils.paddArrayWith = function(array, fullLengthWithZeros, filler) {
    let lengthOfArray = array.length
    for(let i = 0; i < fullLengthWithZeros - lengthOfArray; i++) {
        array.push(filler)
    }
}

ReportUtils.getMonthNameFromCode = function(monthCode) {
    const months = Core.months();
    let foundMonth =_.find(months, aMonth => aMonth.period === monthCode)
    if(foundMonth) {
        return foundMonth.name;
    }
}

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
            if(aTimeDatum.hasOwnProperty('project')) {
                return (aProject.project === aTimeDatum.project)
            } else if(aTimeDatum.hasOwnProperty('successFactorsCostCenter')) {
                return (aProject.successFactorsCostCenter === aTimeDatum.successFactorsCostCenter)
            } else {
                return false
            }
        })

        if(!projectInReportData) {// New project - New employee - New time
            let employeeTimeTotal = parseFloat(aTimeDatum.duration)
            if(isNaN(employeeTimeTotal)) {
                employeeTimeTotal = 0
            }

            reportData.push({
                project: aTimeDatum.project,
                successFactorsCostCenter: aTimeDatum.successFactorsCostCenter,
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
                $or: [
                    {project: {$exists : true}},
                    {"successFactorsCostCenter": {$exists: true}}
                ],
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
                if(aTime.hasOwnProperty('successFactorsCostCenter')) {
                    console.log(`special aTime: `, aTime)
                    aTime.projectDetails = {}
                    let projectDetails = {
                        _id: aTime.successFactorsCostCenter || '',
                        projectName: aTime.successFactorsCostCenter || '---',
                    }
                    _.extend(aTime.projectDetails, projectDetails)
                } else {
                    let project = Projects.findOne({_id: aTime.project})
                    if(project) {
                        aTime.projectDetails = {}
                        let projectDetails = {
                            _id: project._id,
                            projectName: project.name,
                        }
                        _.extend(aTime.projectDetails, projectDetails)
                    }

                    let activity = Activities.findOne({_id: aTime.activity})
                    if(activity) {
                        aTime.activityDetails = {}
                        let activityDetails = {
                            activityName: activity.description
                        }
                        _.extend(aTime.activityDetails, activityDetails)
                    }
                }
                return aTime
            })
            //console.log(`biffUpTimes: ${JSON.stringify(biffedUpTimes)}`)

            return ReportUtils.processedReportDataForProjects(biffedUpTimes)
        }
    },

    'reports/timesForEveryoneByProject_Tabular': function(businessId, startDate, endDate, selectedEmployees) {
        const queryObj = {
            businessId: businessId, 
            'successFactorsCostCenter': {$exists : true},
            day: {$gte: startDate, $lt: endDate},
            status: 'Approved'
        }
        if(selectedEmployees && selectedEmployees.length > 0) {                
            queryObj.employeeId = {$in: selectedEmployees}
        }

        const groupingQuery = {
            _id: {
              "employeeId": "$employeeId",
              "project": "$successFactorsCostCenter"
            }, 
            duration: { $sum: "$duration" }
        }

        let allProjectTimesInMonth = TimeWritings.aggregate([
            { $match: queryObj},
            { $group: groupingQuery }
        ]);
        // console.log(`allProjectTimesInMonth: `, allProjectTimesInMonth)

        const finalResult = []
        const listOfProjectCodes = []

        allProjectTimesInMonth.forEach(timeRecord => {
            const gotEmployeeTime = _.find(finalResult, employeeTime => {
                if(timeRecord._id.employeeId) {
                    return employeeTime._id === timeRecord._id.employeeId
                }
            })
            if(!gotEmployeeTime) {
                const employee = Meteor.users.findOne({_id: timeRecord._id.employeeId})
                if(employee) {
                    employee.employeeProfile = employee.employeeProfile || {}
                    employee.employeeProfile.employeeId = employee.employeeProfile.employeeId || '---'
                    
                    const firstEmployeeTimeRecord = {
                        _id: timeRecord._id.employeeId,
                        employeeFullName: employee.profile.fullName,
                        employeeId: employee.employeeProfile.employeeId,
                        workLocation: employee.employeeProfile.workLocation || '---',
                        totalDuration: timeRecord.duration,
                        projects: [{
                            project: timeRecord._id.project,
                            duration: timeRecord.duration
                        }]
                    }
                    finalResult.push(firstEmployeeTimeRecord)
                }
            } else {
                let projects = gotEmployeeTime.projects;
                let foundEmployeeProjectTime = _.find(projects, project => {
                    return project.project === timeRecord._id.project
                })
                if(foundEmployeeProjectTime) {
                    foundEmployeeProjectTime.duration += timeRecord.duration
                } else {
                    projects.push({
                        project: timeRecord._id.project,
                        duration: timeRecord.duration
                    })
                }
                gotEmployeeTime.totalDuration += timeRecord.duration
            }

            if(listOfProjectCodes.indexOf(timeRecord._id.project || '---') < 0) {
                listOfProjectCodes.push(timeRecord._id.project || '---')                
            }
        })
        console.log(`finalResult: `, finalResult)

        return {employeeData: finalResult, projectCodes: listOfProjectCodes}
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
    'reports/myLeaveRequestsApprovals': function(businessId, startDate, endDate) {
        check(businessId, String)
        this.unblock()
        //--
        // let user = Meteor.user()
        
        // if (!user || !user.employeeProfile || !user.employeeProfile.employment 
        //     || !user.employeeProfile.employment.position){
        //     return
        // }

        // let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
        //     return x._id
        // });
        // const selector = {
        //     businessIds: businessUnitId,
        //     "employeeProfile.employment.position": {$in: positions}
        // };

        // let allSuperviseeIds = []
        // Meteor.users.find().fetch().forEach(aUser => {
        //     let userPositionId = aUser.employeeProfile.employment.position
        //     if(positions.indexOf(userPositionId) !== -1) {
        //         allSuperviseeIds.push(aUser._id)
        //     }
        // });
        let queryObj = {
            businessId: businessId, 
            approvedDate: {$gte: startDate, $lte: endDate},
            approvedBy: this.userId
        }
        let leavesRequestsApproved = Leaves.find(queryObj).fetch();

        let biffedUpLeaveRequests = leavesRequestsApproved.map(aLeave => {
            let employee = Meteor.users.findOne({_id: aLeave.employeeId})
            if(employee) {
                aLeave.createdByFullName = employee.profile.fullName
            }
            return aLeave
        })

        return biffedUpLeaveRequests
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
    },
    
    /* Export Tax payment
    */
   'exportTaxResult': (businessId, period) => {
       check(period, String);
       check(businessId, String);

       if(Core.hasPayrollAccess(this.userid)){
           throw new Meteor.Error(401, 'Unauthorized');
       } else {
           const header = [
               "Full Name",
               "State",
               "Tax Payer ID"
           ];
           let taxData = []

           const payResults = PayResults.find({businessId: businessId, period: period}).fetch() || []
           
           payResults.forEach(aPayResult => {
               let employee = Meteor.users.findOne({_id: aPayResult.employeeId});
               if(employee) {
                   let employeeTaxData = [
                       employee.profile.fullName,
                       employee.employeeProfile.state,
                       employee.employeeProfile.payment.taxPayerId
                   ]
                   littleHelpers.paddArrayWith(employeeTaxData, header.length, '')
                   //--
                   const deductionsInDiffCurrencies = aPayResult.payslipWithCurrencyDelineation.deduction
                   const currencies = Object.keys(deductionsInDiffCurrencies) || []

                   currencies.forEach(aCurrency => {
                       const deductions = deductionsInDiffCurrencies[aCurrency].payments || []
                       deductions.forEach(aDeduction => {
                           if(aDeduction.reference === 'Tax') {
                               let foundTaxCodeIndexInHeader = header.indexOf(`${aDeduction.code}_${aCurrency}`)

                               if(foundTaxCodeIndexInHeader < 0) {
                                   header.push(`${aDeduction.code}_${aCurrency}`)
                                   employeeTaxData.push(aDeduction.value)
                               } else {
                                   employeeTaxData[foundTaxCodeIndexInHeader] = aDeduction.value
                               }
                           }
                       })
                   })

                   taxData.push(employeeTaxData)
               }
           });
           return {fields: header, data: taxData};
       }
   },


   /* Get Tax pay
    */
   'getTaxResult': (businessId, period) => {
       check(period, String);
       check(businessId, String);

       if(Core.hasPayrollAccess(this.userid)){
           throw new Meteor.Error(401, 'Unauthorized');
       } else {
           let taxAmountHeaders = []
           let taxData = []

           const payResults = PayResults.find({businessId: businessId, period: period}).fetch() || []

           payResults.forEach(aPayResult => {
               let employee = Meteor.users.findOne({_id: aPayResult.employeeId});
               if(employee) {
                   let employeeTaxData = {
                       fullName: employee.profile.fullName,
                       state: employee.employeeProfile.state,
                       taxPayerId: employee.employeeProfile.payment.taxPayerId,
                       taxAmounts: {}
                   };
                   //--
                   const deductionsInDiffCurrencies = aPayResult.payslipWithCurrencyDelineation.deduction
                   const currencies = Object.keys(deductionsInDiffCurrencies) || []

                   currencies.forEach(aCurrency => {
                       const deductions = deductionsInDiffCurrencies[aCurrency].payments || []
                       deductions.forEach(aDeduction => {
                           if(aDeduction.reference === 'Tax') {
                               let foundTaxCodeInHeadersList = _.find(taxAmountHeaders, aTaxHeader => {
                                   return aTaxHeader === `${aDeduction.code}_${aCurrency}`
                               })
                               if(!foundTaxCodeInHeadersList) {
                                   taxAmountHeaders.push(`${aDeduction.code}_${aCurrency}`)
                               }
                               employeeTaxData.taxAmounts[`${aDeduction.code}_${aCurrency}`] = aDeduction.value
                           }
                       })
                   })
                   taxData.push(employeeTaxData)
               }
           });
           return {taxAmountHeaders, taxData};
       }
   },

   'exportPensionResult': (businessId, period) => {
       //get all payroll result for specified period if employee is authorized
       check(period, String);
       check(businessId, String);
       if(Core.hasPayrollAccess(this.userId)){
           throw new Meteor.Error(401, 'Unauthorized');
       } else {
           const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Pension'}).fetch();
           const pension = result.map(x => {
               const pensionsContribution = _.where(x.payment, {reference: 'Pension'}); //get all pension pay)
               if(pensionsContribution.length) {
                   const pensionAmount = {};
                   let pensionDescription;
                   pensionsContribution.forEach(x => {
                       //pension is always suffixed with _EE or _ER
                       const pensionLength = x.code.length;
                       if (!pensionDescription)
                           pensionDescription = x.description;
                       const type = x.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                       if(type === '_EE')
                           pensionAmount.employeeContribution  = x.amountLC;
                       if(type === '_ER')
                           pensionAmount.employerContribution = x.amountLC;
                   });
                   //get employee details
                   let employee = Meteor.users.findOne({_id: x.employeeId});
                   if(employee){
                       return [
                           employee.profile.fullName,
                           employee.employeeProfile.payment.pensionmanager,
                           employee.employeeProfile.payment.RSAPin,
                           pensionAmount.employeeContribution,
                           pensionAmount.employerContribution
                       ]
                   }
               }
           });
           const header = [
               "Full Name",
               "Pension Fund Administrator",
               "RSA PIN",
               "Employee Contribution",
               "Employer Contribution"
           ];
           return {fields: header, data: pension};
       }
   },

   'getPensionResult': (businessId, period) => {
       //get all payroll result for specified period if employee is authorized
       check(period, String);
       check(businessId, String);
       if(Core.hasPayrollAccess(this.userId)){
           throw new Meteor.Error(401, 'Unauthorized');
       } else {
           const result =  Payruns.find({businessId: businessId, period: period, 'payment.reference': 'Pension'}).fetch();
           const pension = result.map(x => {
               const pensionsContribution = _.where(x.payment, {reference: 'Pension'}); //get all pension pay)
               if(pensionsContribution.length) {
                   const pensionAmount = {};
                   let pensionDescription;
                   pensionsContribution.forEach(x => {
                      //pension is always suffixed with _EE or _ER
                       const pensionLength = x.code.length;
                       if (!pensionDescription)
                           pensionDescription = x.description;
                       const type = x.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                       if(type === '_EE')
                           pensionAmount.employeeContribution  = x.amountLC;
                       if(type === '_ER')
                           pensionAmount.employerContribution = x.amountLC;
                   });
                   //get employee details
                   let employee = Meteor.users.findOne({_id: x.employeeId});
                   if(employee){
                       const info = {
                           fullName: employee.profile.fullName,
                           pensionManager: employee.employeeProfile.payment.pensionmanager,
                           pin: employee.employeeProfile.payment.RSAPin,
                           employeeContribution: pensionAmount.employeeContribution,
                           employerContribution: pensionAmount.employerContribution
                       }
                       return info;
                   }
               }
           });
           return pension;
       }
   },

   'getAnnualPensionResult': (businessId, year) => {
        check(year, String);
        check(businessId, String);

        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let periodsOfTheYear = _.range(12).map(aMonthIndex => {
                aMonthIndex += 1;
                aMonthIndex = aMonthIndex < 10 ? '0' + aMonthIndex : aMonthIndex;

                return `${aMonthIndex}${year}`
            })

            const payrunResults =  Payruns.find({
                businessId: businessId, 
                period: {$in: periodsOfTheYear}, 
                'payment.reference': 'Pension'
            }).fetch();
            
            let employeeIds = _.pluck(payrunResults, 'employeeId')
            let uniqueEmployeeIds = _.uniq(employeeIds)

            let pensionData = uniqueEmployeeIds.map(anEmployeeId => {
                let employeePensionData = {
                    monthContributions: []
                }

                let employee = Meteor.users.findOne({_id: anEmployeeId});
                if(employee) {
                    employeePensionData.fullName = employee.profile.fullName
                    employeePensionData.pensionManager = employee.employeeProfile.payment.pensionmanager
                    employeePensionData.pin = employee.employeeProfile.payment.RSAPin
                    //--
                    employeePensionData.monthContributions = periodsOfTheYear.map(aPeriod => {
                        let employeePayrunForPeriod = _.find(payrunResults, aPayrunResult => {
                            return (aPayrunResult.period === aPeriod) && aPayrunResult.employeeId === anEmployeeId
                        })

                        const pensionAmounts = {
                            employeeContribution: '',
                            employerContribution: ''
                        }

                        if(employeePayrunForPeriod) {
                            const pensionsContribution = _.where(employeePayrunForPeriod.payment, {reference: 'Pension'}); //get all pension pay)
                            
                            if(pensionsContribution.length) {
                                let pensionDescription;

                                pensionsContribution.forEach(pensionContrib => {
                                    const pensionLength = pensionContrib.code.length;
                                    
                                    const type = pensionContrib.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                                    if(type === '_EE')
                                        pensionAmounts.employeeContribution  = pensionContrib.amountLC;
                                    if(type === '_ER')
                                        pensionAmounts.employerContribution = pensionContrib.amountLC;
                                });
                            }
                        }
                        return pensionAmounts
                    })
                }
                return employeePensionData
            })
            return pensionData
        }
    },

   'exportAnnualPensionResult': (businessId, year) => {
        check(year, String);
        check(businessId, String);

        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let periodsOfTheYear = _.range(12).map(aMonthIndex => {
                aMonthIndex += 1;
                aMonthIndex = aMonthIndex < 10 ? '0' + aMonthIndex : aMonthIndex;

                return `${aMonthIndex}${year}`
            })

            const payrunResults =  Payruns.find({
                businessId: businessId, 
                period: {$in: periodsOfTheYear}, 
                'payment.reference': 'Pension'
            }).fetch();
            
            let employeeIds = _.pluck(payrunResults, 'employeeId')
            let uniqueEmployeeIds = _.uniq(employeeIds)

            let pensionData = uniqueEmployeeIds.map(anEmployeeId => {
                let employeePensionData = []

                let employee = Meteor.users.findOne({_id: anEmployeeId});
                if(employee) {
                    employeePensionData.push(employee.profile.fullName)
                    employeePensionData.push(employee.employeeProfile.payment.pensionmanager)
                    employeePensionData.push(employee.employeeProfile.payment.RSAPin)
                    //--
                    periodsOfTheYear.forEach(aPeriod => {
                        let employeePayrunForPeriod = _.find(payrunResults, aPayrunResult => {
                            return (aPayrunResult.period === aPeriod) && aPayrunResult.employeeId === anEmployeeId
                        })

                        const pensionAmounts = {
                            employeeContribution: '',
                            employerContribution: ''
                        }

                        if(employeePayrunForPeriod) {
                            const pensionsContribution = _.where(employeePayrunForPeriod.payment, {reference: 'Pension'}); //get all pension pay)
                            
                            if(pensionsContribution.length) {
                                let pensionDescription;

                                pensionsContribution.forEach(pensionContrib => {
                                    const pensionLength = pensionContrib.code.length;
                                    
                                    const type = pensionContrib.code.substring(pensionLength, pensionLength - 3); //returns _EE or _ER
                                    if(type === '_EE')
                                        pensionAmounts.employeeContribution  = pensionContrib.amountLC;
                                    if(type === '_ER')
                                        pensionAmounts.employerContribution = pensionContrib.amountLC;
                                });
                            }
                        }

                        employeePensionData.push(pensionAmounts.employeeContribution)
                        employeePensionData.push(pensionAmounts.employerContribution)
                    })
                }
                return employeePensionData
            })

            let genesisRowOfExportData = ['', '', '']

            periodsOfTheYear.forEach(aPeriod => {
                genesisRowOfExportData.push("Employee Contribution")
                genesisRowOfExportData.push("Employer Contribution")                
            })
            pensionData.splice(0, 0, genesisRowOfExportData)

           const header = [
                "Name",
                "Pension Fund Administrator",
                "RSA Number"
            ];
            Core.months().forEach(aMonth => {
                header.push(aMonth.name)
                header.push('')
            })
                
            return {fields: header, data: pensionData};

            // return pensionData
        }
    },
    'getAnnualTaxResult': (businessId, year) => {
        check(year, String);
        check(businessId, String);

        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let periodsOfTheYear = _.range(12).map(aMonthIndex => {
                aMonthIndex += 1;
                aMonthIndex = aMonthIndex < 10 ? '0' + aMonthIndex : aMonthIndex;

                return `${aMonthIndex}${year}`
            })

            let taxAmountHeaders = []  // {Month: [tax headers ...]}

            const payResults = PayResults.find({
                businessId: businessId,
                period: {$in: periodsOfTheYear}
            }).fetch() || []

            let employeeIds = _.pluck(payResults, 'employeeId')
            let uniqueEmployeeIds = _.uniq(employeeIds)

            let taxData = uniqueEmployeeIds.map(anEmployeeId => {
                let employeeTaxData = {
                    monthTax: []    // For each month, account for different currencies on different paygrades
                }

                let employee = Meteor.users.findOne({_id: anEmployeeId});
                if(employee) {
                    employeeTaxData.fullName = employee.profile.fullName
                    employeeTaxData.state = employee.employeeProfile.state
                    employeeTaxData.taxPayerId = employee.employeeProfile.payment.taxPayerId
                    //--
                    employeeTaxData.monthTax = periodsOfTheYear.map(aPeriod => {
                        let employeePayresultsForPeriod = _.find(payResults, aPayrunResult => {
                            return (aPayrunResult.period === aPeriod) && aPayrunResult.employeeId === anEmployeeId
                        })
                        let benefitsForMonth = {};
                        let taxAmountsForMonth = {};

                        if(employeePayresultsForPeriod) {
                            let monthCode = aPeriod.substring(0, 2);

                            const benefitsInDiffCurrencies = employeePayresultsForPeriod.payslipWithCurrencyDelineation.benefit
                            const deductionsInDiffCurrencies = employeePayresultsForPeriod.payslipWithCurrencyDelineation.deduction
                            const currencies = Object.keys(deductionsInDiffCurrencies) || []

                            currencies.forEach(aCurrency => {
                                const deductions = deductionsInDiffCurrencies[aCurrency].payments || []
                                deductions.forEach(aDeduction => {
                                    if(aDeduction.reference === 'Tax') {
                                        let foundTaxHeaderForMonth = _.find(taxAmountHeaders, aTaxHeader => {
                                            return aTaxHeader.monthCode === monthCode
                                        })
                                        if(foundTaxHeaderForMonth) {
                                            let foundTaxCodeInHeaders = _.find(foundTaxHeaderForMonth.taxCodes, aTaxHeaderCode => {
                                                return aTaxHeaderCode === `${aDeduction.code}_${aCurrency}`
                                            })
                                            if(!foundTaxCodeInHeaders) {
                                                foundTaxHeaderForMonth.taxCodes = foundTaxHeaderForMonth.taxCodes || [];
                                                foundTaxHeaderForMonth.taxCodes.push(`${aDeduction.code}_${aCurrency}`);
                                            }
                                        } else {
                                            taxAmountHeaders.push({
                                                monthCode: monthCode,
                                                taxCodes: [`${aDeduction.code}_${aCurrency}`]
                                            })
                                        }
                                        taxAmountsForMonth[`${aDeduction.code}_${aCurrency}`] = aDeduction.value
                                    }
                                })
                                //--
                                let foundTaxHeaderForMonth = _.find(taxAmountHeaders, aTaxHeader => {
                                    return aTaxHeader.monthCode === monthCode
                                })
                                if(foundTaxHeaderForMonth) {
                                    let foundTaxCodeInHeaders = _.find(foundTaxHeaderForMonth.taxCodes, aTaxHeaderCode => {
                                        return aTaxHeaderCode === `TotalBenefits_${aCurrency}`
                                    })
                                    if(!foundTaxCodeInHeaders) {
                                        foundTaxHeaderForMonth.taxCodes = foundTaxHeaderForMonth.taxCodes || [];
                                        foundTaxHeaderForMonth.taxCodes.push(`TotalBenefits_${aCurrency}`);
                                    }
                                } else {
                                    taxAmountHeaders.push({
                                        monthCode: monthCode,
                                        taxCodes: [`TotalBenefits_${aCurrency}`]
                                    })
                                }
                                const totalBenefits = benefitsInDiffCurrencies[aCurrency].total || 0
                                benefitsForMonth[`TotalBenefits_${aCurrency}`] = totalBenefits
                            })
                        }
                        Object.assign(taxAmountsForMonth, benefitsForMonth)

                        return taxAmountsForMonth;
                    });
                }
                return employeeTaxData;
            });

            return {taxAmountHeaders, taxData};
        }
    },

    'getAnnualPayResult': (businessId, year) => {
        check(year, String);
        check(businessId, String);

        if(Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, 'Unauthorized');
        } else {
            let periodsOfTheYear = _.range(12).map(aMonthIndex => {
                aMonthIndex += 1;
                aMonthIndex = aMonthIndex < 10 ? '0' + aMonthIndex : aMonthIndex;

                return `${aMonthIndex}${year}`
            })
            const pensionPayrunResults =  Payruns.find({
                businessId: businessId, 
                period: {$in: periodsOfTheYear}, 
                'payment.reference': 'Pension'
            }).fetch();

            let taxAmountHeaders = []  // {Month: [tax headers ...]}

            const payResults = PayResults.find({
                businessId: businessId,
                period: {$in: periodsOfTheYear}
            }).fetch() || []

            let employeeIds = _.pluck(payResults, 'employeeId')
            let uniqueEmployeeIds = _.uniq(employeeIds)

            let taxData = uniqueEmployeeIds.map(anEmployeeId => {
                let employeeTaxData = {
                    monthTax: []    // For each month, account for different currencies on different paygrades
                }

                let employee = Meteor.users.findOne({_id: anEmployeeId});
                if(employee) {
                    employeeTaxData.fullName = employee.profile.fullName
                    //--
                    employeeTaxData.monthTax = periodsOfTheYear.map(aPeriod => {
                        let employeePayresultsForPeriod = _.find(payResults, aPayrunResult => {
                            return (aPayrunResult.period === aPeriod) && aPayrunResult.employeeId === anEmployeeId
                        })
                        let benefitsForMonth = {};
                        let taxAmountsForMonth = {};
                        let netPayForMonth = {};

                        const pensionAmounts = {
                            employeeContribution: '',
                            employerContribution: ''
                        }

                        if(employeePayresultsForPeriod) {
                            let monthCode = aPeriod.substring(0, 2);

                            const benefitsInDiffCurrencies = employeePayresultsForPeriod.payslipWithCurrencyDelineation.benefit
                            const deductionsInDiffCurrencies = employeePayresultsForPeriod.payslipWithCurrencyDelineation.deduction
                            
                            const currencies = Object.keys(deductionsInDiffCurrencies) || []
                            const benefitCurrencies = Object.keys(deductionsInDiffCurrencies) || []

                            currencies.forEach(aCurrency => {
                                const deductions = deductionsInDiffCurrencies[aCurrency].payments || []
                                deductions.forEach(aDeduction => {
                                    if(aDeduction.reference === 'Tax' || aDeduction.reference === 'Pension') {
                                        let foundTaxHeaderForMonth = _.find(taxAmountHeaders, aTaxHeader => {
                                            return aTaxHeader.monthCode === monthCode
                                        })
                                        if(foundTaxHeaderForMonth) {
                                            let foundTaxCodeInHeaders = _.find(foundTaxHeaderForMonth.taxCodes, aTaxHeaderCode => {
                                                return aTaxHeaderCode === `${aDeduction.code}_${aCurrency}`
                                            })
                                            if(!foundTaxCodeInHeaders) {
                                                foundTaxHeaderForMonth.taxCodes = foundTaxHeaderForMonth.taxCodes || [];
                                                foundTaxHeaderForMonth.taxCodes.push(`${aDeduction.code}_${aCurrency}`);
                                            }
                                        } else {
                                            taxAmountHeaders.push({
                                                monthCode: monthCode,
                                                taxCodes: [`${aDeduction.code}_${aCurrency}`]
                                            })
                                        }
                                        taxAmountsForMonth[`${aDeduction.code}_${aCurrency}`] = aDeduction.value
                                    }
                                })
                                //--
                                let foundTaxHeaderForMonth = _.find(taxAmountHeaders, aTaxHeader => {
                                    return aTaxHeader.monthCode === monthCode
                                })
                                if(foundTaxHeaderForMonth) {
                                    let foundTaxCodeInHeaders = _.find(foundTaxHeaderForMonth.taxCodes, aTaxHeaderCode => {
                                        return aTaxHeaderCode === `TotalBenefits_${aCurrency}`
                                    })
                                    if(!foundTaxCodeInHeaders) {
                                        foundTaxHeaderForMonth.taxCodes = foundTaxHeaderForMonth.taxCodes || [];
                                        foundTaxHeaderForMonth.taxCodes.push(`TotalBenefits_${aCurrency}`);
                                    }
                                } else {
                                    taxAmountHeaders.push({
                                        monthCode: monthCode,
                                        taxCodes: [`TotalBenefits_${aCurrency}`]
                                    })
                                }
                                //--
                                if(foundTaxHeaderForMonth) {
                                    let foundTaxCodeInHeaders = _.find(foundTaxHeaderForMonth.taxCodes, aTaxHeaderCode => {
                                        return aTaxHeaderCode === `NetPay_${aCurrency}`
                                    })
                                    if(!foundTaxCodeInHeaders) {
                                        foundTaxHeaderForMonth.taxCodes = foundTaxHeaderForMonth.taxCodes || [];
                                        foundTaxHeaderForMonth.taxCodes.push(`NetPay_${aCurrency}`);
                                    }
                                } else {
                                    taxAmountHeaders.push({
                                        monthCode: monthCode,
                                        taxCodes: [`NetPay_${aCurrency}`]
                                    })
                                }
                                
                                const totalBenefits = benefitsInDiffCurrencies[aCurrency].total || 0
                                benefitsForMonth[`TotalBenefits_${aCurrency}`] = totalBenefits

                                const totalDeductions = deductionsInDiffCurrencies[aCurrency].total || 0
                                netPayForMonth[`NetPay_${aCurrency}`] = totalBenefits + totalDeductions
                            })
                        }
                        Object.assign(taxAmountsForMonth, benefitsForMonth)
                        Object.assign(taxAmountsForMonth, netPayForMonth)

                        return taxAmountsForMonth;
                    });
                }
                return employeeTaxData;
            });

            return {taxAmountHeaders, taxData};
        }
    }
})
