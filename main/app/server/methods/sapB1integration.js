import _ from 'underscore';
import { HTTP } from 'meteor/http'


let SapIntegration = {}

SapIntegration.getDetailedPayrunResultForEmployee = (employeeId, detailedPayrunResults) => {
    return _.find(detailedPayrunResults, (aDetailedPayrunResult) => {
        return aDetailedPayrunResult.employeeId === employeeId
    })
}

SapIntegration.getTaxForBulkSum = function (employeeDetailedPayrunResult, currencyRatesForPeriod, localCurrency) {
    let deductionPayments = employeeDetailedPayrunResult.payslipWithCurrencyDelineation.deduction;
    let totalTaxInLocalCurrency = 0

    let currencies = Object.keys(deductionPayments)
    for(let aCurrency of currencies) {
        let paymentsInCurrency = deductionPayments[aCurrency].payments

        for(let aPayment of paymentsInCurrency) {
            if (aPayment.reference === 'Tax') {
                if(aCurrency !== localCurrency.iso) {
                    let currencyRate = _.find(currencyRatesForPeriod, (aCurrencyRate) => {
                        return aCurrencyRate.code === aCurrency
                    })
                    if(currencyRate) {
                        if(!isNaN(currencyRate.rateToBaseCurrency) && !isNaN(aPayment.value)) {
                            aPayment.value = aPayment.value.toFixed(2)
                            totalTaxInLocalCurrency += (Math.abs(aPayment.value) * currencyRate.rateToBaseCurrency)
                        }
                    }
                } else {
                    if(!isNaN(aPayment.value)) {
                        aPayment.value = aPayment.value.toFixed(2)
                        totalTaxInLocalCurrency += Math.abs(aPayment.value)
                    }
                }
            }
        }
    }

    return totalTaxInLocalCurrency;
}

/**
 * Goes through all employee payrun results for the period and accumulates a bulksum for each paytype
 *
 * @param {Object} businessUnitSapConfig - the SAP config for the business
 * @param {Array} payRunResults -
 * @return {Object, Object, Array} Bulksum for units, Bulksum for projects, Array of employees that contribute to bulksum
 */
SapIntegration.processPayrunResultsForSap = function (businessUnitSapConfig, payRunResults, period, localCurrency) {
    let unitsBulkSum = {}
    let projectsBulkSum = {}
    let arrayOfEmployees = []
    let status = true
    let errors = []

    let allPaytypes = PayTypes.find({businessId: businessUnitSapConfig.businessId}).fetch();
    let allTaxes = Tax.find({businessId: businessUnitSapConfig.businessId}).fetch()
    let allProjects = Projects.find({businessId: businessUnitSapConfig.businessId}).fetch()
    let detailedPayRunResults = PayResults.find({
        period: period, 
        businessId: businessUnitSapConfig.businessId
    }).fetch();

    let currencyRatesForPeriod = Currencies.find({businessId: businessUnitSapConfig.businessId, period: period}).fetch()

    let getUnitForPosition = (entity) => {
        let possibleUnitId = entity.parentId
        if(possibleUnitId) {
            let possibleUnit = EntityObjects.findOne({_id: possibleUnitId})
            if(possibleUnit) {
                if(possibleUnit.otype === 'Unit') {
                    return possibleUnit
                } else {
                    return getUnitForPosition(possibleUnit)
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    let shortenMemoForSapJournalEntry = (paytypeDesc, memoTag, unitName) => {
        if(paytypeDesc && unitName) {
            let defaultMemo = paytypeDesc + memoTag + unitName + ")"
            if(defaultMemo.length > 49) {
                let paytypeDescShortened = paytypeDesc
                if(paytypeDesc.length > 17) {
                    paytypeDescShortened = paytypeDesc.substring(0, 12) + ' ...'
                }
                //--
                let charactersLeft = paytypeDescShortened.length + 16
                let unitShortened = paytypeDesc

                let memoLengthWithUnitName = charactersLeft + memoTag.length + unitName.length
                if(memoLengthWithUnitName > 47) {
                    unitShortened = unitName.substring(0, 12) + ' ...'
                }
                return paytypeDescShortened + memoTag + unitShortened + ")"
            } else {
                return defaultMemo
            }
        } else {
            return '---'
        }
    }

    //--Main processing happens here
    for(let aPayrunResult of payRunResults) {
        let isPostedToSAP = aPayrunResult.isPostedToSAP
        if(isPostedToSAP && isPostedToSAP === true) {
            continue
        }
        let employeeId = aPayrunResult.employeeId
        let employee = Meteor.users.findOne({_id: employeeId})

        if(!employee) {
            status = false
            errors.push(`An employee record for payrun could not be found`)
            continue
        }
        let employeePositionId = employee.employeeProfile.employment.position
        let position = EntityObjects.findOne({_id: employeePositionId, otype: 'Position'})

        try {
            if(!position) {
                status = false
                errors.push(`Employee: ${employee.profile.fullName} does not have a position`)
                continue
            }
            //--
            let unit = getUnitForPosition(position)
            if(!unit) {
                status = false
                errors.push(`Employee: ${employee.profile.fullName} does not have a unit`)
                continue
            }
            //--
            let unitId = unit._id

            let sapUnitCostCenterDetails = _.find(businessUnitSapConfig.units, (aUnit) => {
                return aUnit.unitId === unitId;
            })
            if(!sapUnitCostCenterDetails  || 
                (!sapUnitCostCenterDetails.costCenterCode || sapUnitCostCenterDetails.costCenterCode.length === 0)) {
                status = false
                errors.push(`Unit: ${unit.name} does not have an SAP cost center`)
            }
            //--
            if(!unitsBulkSum[unitId]) {
                unitsBulkSum[unitId] = {}
                unitsBulkSum[unitId]['costCenterCode'] = sapUnitCostCenterDetails.costCenterCode
                unitsBulkSum[unitId]['payments'] = []
            }
            let unitToWorkWith = unitsBulkSum[unitId]
            let unitBulkSumPayments = unitToWorkWith.payments
            //--
            let employeeDetailedPayrunResult = SapIntegration.getDetailedPayrunResultForEmployee(employeeId, detailedPayRunResults);

            aPayrunResult.payment.forEach(aPayment => {
                if(aPayment && aPayment.id) {
                    let payTypeFullDetails = _.find(allPaytypes, function (aPayType) {
                        return (aPayType._id && (aPayType._id === aPayment.id));
                    })
                    //--
                    if(payTypeFullDetails) {
                        if(businessUnitSapConfig.businessId === 'udrayHAGvXXDgzzGf' && 
                            employee.employeeProfile.employment.paygrade === 'QqMgrdDpasdgP4CZE') {
                            // DeltaTek and employee is of 'National' paygrade
                            if(payTypeFullDetails._id === 'Wd8Smd5fsNfSRfxLg') {// Gross Pay paytype
                                return // Go to next iteration
                            }
                        }
                        if(!payTypeFullDetails.includeWithSapIntegration || payTypeFullDetails.includeWithSapIntegration === false) {
                            return // Go to next iteration
                        }
                    }
                    //--
                    let sapPayTypeDetails = _.find(businessUnitSapConfig.payTypes, function (aPayType) {
                        return aPayType.payTypeId === aPayment.id;
                    })

                    if(!sapPayTypeDetails) {
                        if (aPayment.reference === 'Tax' || aPayment.reference === 'Pension') {
                            let sapConfigToUse = {}
                            if(aPayment.reference === 'Tax') {
                                sapConfigToUse = _.find(businessUnitSapConfig.taxes, function (aPayType) {
                                    return aPayType.payTypeId === aPayment.id;
                                })
    
                            } else {
                                sapConfigToUse = _.find(businessUnitSapConfig.pensions, function (aPayType) {
                                    return aPayType.pensionId === aPayment.id && (aPayType.pensionCode === aPayment.code);
                                })    
                            }

                            if(sapConfigToUse) {
                                let payTypeDebitAccountCode = ""
                                let payTypeCreditAccountCode = ""
                                if (sapConfigToUse.payTypeDebitAccountCode) {
                                    payTypeDebitAccountCode = sapConfigToUse.payTypeDebitAccountCode
                                } else {
                                    status = false
                                    errors.push(`Paytype: ${aPayment.description} does not have an SAP Debit G/L account`)
                                }
                                if (sapConfigToUse.payTypeCreditAccountCode) {
                                    payTypeCreditAccountCode = sapConfigToUse.payTypeCreditAccountCode
                                } else {
                                    status = false
                                    errors.push(`Paytype: ${aPayment.description} does not have an SAP Credit G/L account`)
                                }
                                if(!payTypeDebitAccountCode || !payTypeDebitAccountCode) {
                                    return
                                }
                                let description = ''
                                if(aPayment.reference === 'Tax') {
                                    description = shortenMemoForSapJournalEntry(aPayment.description, " (Cost-Center: ", unit.name)
                                } else {
                                    description = shortenMemoForSapJournalEntry(aPayment.code, " (Cost-Center: ", unit.name)
                                }

                                let taxOrPensionAmount = 0
                                if(aPayment.reference === 'Tax') {
                                    taxOrPensionAmount = SapIntegration.getTaxForBulkSum(employeeDetailedPayrunResult, currencyRatesForPeriod, localCurrency)
                                } else {
                                    taxOrPensionAmount = aPayment.amountLC || 0
                                }

                                unitBulkSumPayments.push({
                                    payTypeId: aPayment.id,
                                    costCenterPayAmount: taxOrPensionAmount,
                                    description: description,
                                    payTypeDebitAccountCode: payTypeDebitAccountCode,
                                    payTypeCreditAccountCode: payTypeCreditAccountCode,
                                })
                            }
                        } else {
                            return
                        }
                    }
                    //--
                    let paymentToAccumulate = _.find(unitBulkSumPayments, (aUnitPayment) => {
                        return aUnitPayment.payTypeId === aPayment.id
                    })

                    //--
                    if(paymentToAccumulate) {
                        paymentToAccumulate.costCenterPayAmount += (aPayment.costCenterPayAmount || 0)
                    } else {
                        let payTypeDebitAccountCode = null
                        let payTypeCreditAccountCode = null

                        if (sapPayTypeDetails.payTypeDebitAccountCode) {
                            payTypeDebitAccountCode = sapPayTypeDetails.payTypeDebitAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP Cost-Center Debit G/L account`)
                        }
                        if (sapPayTypeDetails.payTypeCreditAccountCode) {
                            payTypeCreditAccountCode = sapPayTypeDetails.payTypeCreditAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP Cost-Center Credit G/L account`)
                        }
                        if(!payTypeDebitAccountCode || !payTypeDebitAccountCode) {
                            return
                        }
                        if (sapPayTypeDetails.payTypeDebitAccountCode && sapPayTypeDetails.payTypeCreditAccountCode) {
                            unitBulkSumPayments.push({
                                payTypeId: aPayment.id,
                                costCenterPayAmount: aPayment.costCenterPayAmount || 0,
                                description: shortenMemoForSapJournalEntry(aPayment.description, " (Cost-Center: ", unit.name),
                                payTypeDebitAccountCode: payTypeDebitAccountCode,
                                payTypeCreditAccountCode: payTypeCreditAccountCode
                            })
                        }
                    }
                    //--
                    let paymentProjectsPay = aPayment.projectsPay || []
                    paymentProjectsPay.forEach(aProjectPay => {
                        let payTypeProjectDebitAccountCode = null
                        let payTypeProjectCreditAccountCode = null
                        //--
                        if (sapPayTypeDetails.payTypeProjectDebitAccountCode) {
                            payTypeProjectDebitAccountCode = sapPayTypeDetails.payTypeProjectDebitAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP Project Debit G/L account`)
                        }
                        if (sapPayTypeDetails.payTypeProjectCreditAccountCode) {
                            payTypeProjectCreditAccountCode = sapPayTypeDetails.payTypeProjectCreditAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP Project Credit G/L account`)
                        }
                        //--
                        if(!payTypeProjectDebitAccountCode || !payTypeProjectCreditAccountCode) {
                            return
                        }
                        //--
                        let projectName = ''
                        let projectData = _.find(allProjects, (project) => {
                            return (project._id === aProjectPay.projectId)
                        })
                        if(projectData) {
                            projectName = projectData.name
                        } else {
                            status = false
                            errors.push(`A project which exists for payrun does not exist on the BulkPay system`)
                        }
                        //--
                        if(!projectsBulkSum[aProjectPay.projectId]) {
                            projectsBulkSum[aProjectPay.projectId] = {}

                            let sapUnitProjectDetails = _.find(businessUnitSapConfig.projects, (aProject) => {
                                return (aProject.projectId === aProjectPay.projectId)
                            })
                            if(!sapUnitProjectDetails  || 
                                (!sapUnitProjectDetails.projectSapCode || sapUnitProjectDetails.projectSapCode.length === 0)) {
                                status = false
                                if(projectData) {
                                    errors.push(`Project: ${projectName} does not have an SAP project code`)
                                } else {
                                    errors.push(`A project does not have an SAP project code`)
                                }
                                return
                            }
                            projectsBulkSum[aProjectPay.projectId]['projectSapCode'] = sapUnitProjectDetails.projectSapCode
                            projectsBulkSum[aProjectPay.projectId]['payments'] = []
                        }
                        let projectInBulkSum = projectsBulkSum[aProjectPay.projectId]
                        let projectBulkSumPayments = projectInBulkSum.payments

                        let projectPaymentToAccumulate = _.find(projectBulkSumPayments, (aProjectPayment) => {
                            return aProjectPayment.payTypeId === aPayment.id
                        })
                        if(projectPaymentToAccumulate) {
                            projectPaymentToAccumulate.projectPayAmount += aProjectPay.payAmount
                        } else {
                            projectBulkSumPayments.push({
                                payTypeId: aPayment.id,
                                projectPayAmount: aProjectPay.payAmount, 
                                description: shortenMemoForSapJournalEntry(aPayment.description, " (Project: ", projectData.name),
                                payTypeProjectDebitAccountCode: payTypeProjectDebitAccountCode,
                                payTypeProjectCreditAccountCode: payTypeProjectCreditAccountCode
                            })
                        }
                    })
                }
            })
            arrayOfEmployees.push(employeeId)                            
        } catch(ex) {
            status = false
            errors.push(`${ex.message}`)
        }
    }

    // console.log(`Number of employees affected: ${arrayOfEmployees.length}`)
    if(status) {
        return {status, unitsBulkSum, projectsBulkSum, employees: arrayOfEmployees}
    } else {
        return {status, errors}
    }
}


/**
 *  SAP B1 Integration Methods
 */
Meteor.methods({
    'sapB1integration/testConnection': function (businessId, sapConfig) {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()

        let userId = Meteor.userId();
        //--
        if(sapConfig) {
          let connectionUrl = `${sapConfig.protocol}://${sapConfig.ipAddress}:19080/api/connectiontest`

          let postData = JSON.stringify(sapConfig)
          let requestHeaders = {'Content-Type': 'application/json'}
          let errorResponse = null
          try {
              let connectionTestResponse = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
              let actualServerResponse = connectionTestResponse.data.replace(/\//g, "")

              let serverResponseObj = JSON.parse(actualServerResponse)

              if(serverResponseObj.status === true) {
                  let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessId});
                  if(businessUnitSapConfig) {
                      SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : sapConfig});
                  } else {
                      sapConfig.businessId = businessUnitId
                      SapBusinessUnitConfigs.insert(sapConfig)
                  }
              }
              return actualServerResponse.replace(/\//g, "")
          } catch(e) {
              errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
          }
          return errorResponse;
        } else {
            return '{"status": false, "message": "SAP Config empty"}'
        }
    },
    "sapB1integration/updateUnitCostCenters": function(businessUnitId, unitCostCenterCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()        
        //--
        if(unitCostCenterCodesArray && unitCostCenterCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {units: unitCostCenterCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessId: businessUnitId, units: unitCostCenterCodesArray})
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty cost centers data for units");
        }
    },
    "sapB1integration/updateProjectCodes": function(businessUnitId, projectCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        //--
        if(projectCodesArray && projectCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {projects: projectCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessId: businessUnitId, projects: projectCodesArray})
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty project codes data");
        }
    },
    "sapB1integration/updatePayTypeGlAccountCodes": function(businessUnitId, payTypesGLAccountCodesArray, 
        taxesGLAccountCodesArray, pensionGLAccountCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        //--
        if(payTypesGLAccountCodesArray && payTypesGLAccountCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, 
                {$set : {
                    payTypes: payTypesGLAccountCodesArray,
                    taxes: taxesGLAccountCodesArray,
                    pensions: pensionGLAccountCodesArray
                }});
            } else {
                SapBusinessUnitConfigs.insert({
                    businessId: businessUnitId, 
                    payTypes: payTypesGLAccountCodesArray,
                    taxes: taxesGLAccountCodesArray,
                    pensions: pensionGLAccountCodesArray
                })
            }
            return true;
        } else {
            throw new Meteor.Error(404, "Empty GL accounts data for pay types");
        }
    },
    'sapB1integration/postPayrunResults': function (businessUnitId, period) {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()

        let errorResponse = null
        try {
            let payRunResult = Payruns.find({period: period, businessId: businessUnitId}).fetch();
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId})

            if(!businessUnitSapConfig) {
                return JSON.stringify({
                    "status": false,
                    "message": "Your company's sap integration setup has not been done"
                })
            }
            let user = Meteor.user();
            let tenantId = user.group;
            let tenant = Tenants.findOne(tenantId)        
            let localCurrency = {}
            if (tenant) {
                localCurrency = tenant.baseCurrency;
            }
        
            let processingResult = SapIntegration.processPayrunResultsForSap(businessUnitSapConfig, payRunResult, period, localCurrency)
            // console.log(`processingResult: ${JSON.stringify(processingResult)}`)
            
            if(processingResult.status === true) {
                if(processingResult.employees.length > 0) {
                    let connectionUrl = `${businessUnitSapConfig.protocol}://${businessUnitSapConfig.ipAddress}:19080/api/payrun`
                    let postData = JSON.stringify({
                        period: period,

                        sapServername: businessUnitSapConfig.sapServername,
                        sapUsername: businessUnitSapConfig.sapUsername,
                        sapUserPassword: businessUnitSapConfig.sapUserPassword,
                        sapCompanyDatabaseName: businessUnitSapConfig.sapCompanyDatabaseName,
                        sapDatabaseUsername: businessUnitSapConfig.sapDatabaseUsername,
                        sapDatabasePassword: businessUnitSapConfig.sapDatabasePassword,

                        unitsBulkSum: processingResult.unitsBulkSum,
                        projectsBulkSum: processingResult.projectsBulkSum,
                    })
                    let requestHeaders = {'Content-Type': 'application/json'}

                    let serverRes = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
                    let actualServerResponse = serverRes.data.replace(/\//g, "")
                    // console.log(`actualServerResponse`, actualServerResponse)

                    let serverResponseObj = JSON.parse(actualServerResponse)

                    if(serverResponseObj.status === true) {
                        processingResult.employees.forEach((anEmployeeId) => {
                            let payrunDoc = Payruns.findOne({
                                businessId: businessUnitId,
                                period: period,
                                employeeId: anEmployeeId
                            })
                            if(payrunDoc) {
                               Payruns.update(payrunDoc._id, {$set: {isPostedToSAP: true}})
                            } else {
                                //console.log(`Could not find payrunDoc`)
                            }
                        })
                    }
                    return actualServerResponse.replace(/\//g, "")
                } else {
                    return JSON.stringify({"status": false, "message": "There are no employee payments to post to SAP"})
                }
            } else {
                return JSON.stringify(processingResult)
            }
        } catch(e) {
            errorResponse = '{"status": false, "message": "Could not connect to SAP Integration service"}'
        }
        return errorResponse;
    }
});
