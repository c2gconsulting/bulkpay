let soap = require('soap');

let sapHanaWsdl = "https://sandbox.hsdf.systems:8001/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/post_gl_1/215/post_gl/post_gl?sap-client=215"
let GLPostEndpoint = "https://sandbox.hsdf.systems:8001/sap/bc/srt/rfc/sap/post_gl_1/215/post_gl/post_gl"


// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
        padString = String((typeof padString !== 'undefined' ? padString : ' '));
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

const HanaIntegrationHelper = {
  getAuthHeader: (sfConfig) => {
      const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
      const password = sfConfig.password

      const authenticationToken = new Buffer(`${username}:${password}`).toString('base64')
    
      return {
        Authorization: `Basic ${authenticationToken}`
      }
  },
  getOdataResults: (odataResponse) => {
      if(odataResponse && odataResponse.d && odataResponse.d.results 
          && odataResponse.d.results.length > 0) {
          return odataResponse.d.results
      } else {
          return []
      }
  },

  getJournalPostData: (processingResult, period, month, year, localCurrency) => {
    // const now = moment().format('YYYY-MM-DD')
    const now = moment().year(2017).month(0).date(1).format('YYYY-MM-DD')    
    year = '2017'
    month = '1'

    const documentHeader = {
        Username: '0odir01',
        HeaderTxt: 'Journal for Payroll',
        CompCode: '1710',
        DocDate: `${now}`,
        PstngDate: `${now}`,
        TransDate: `${now}`,
        FiscYear: year,
        FisPeriod: month,
        DocType: 'SA',
        DocStatus: '2'
    }

    let glItems = []
    let currencyItems = []
    //--
    let unitsBulkSum = processingResult.unitsBulkSum
    let unitIds = Object.keys(unitsBulkSum)

    let itemNoCounter = 1
    unitIds.forEach(unitId => {
        const costCenterCode = unitsBulkSum[unitId].costCenterCode
        let payments = unitsBulkSum[unitId].payments;

        payments.forEach(payment => {
            glItems.push({
                ItemnoAcc: `${itemNoCounter}`,
                GlAccount: payment.payTypeDebitAccountCode,
                ItemText: payment.description,
                PstngDate: `${now}`,
                ValueDate: `${now}`,
                FmArea: '1000',
                TaxCode: 'V0',
                Costcenter: costCenterCode,
                Orderid: '',
                Fund: `10000000`,
                FundsCtr: '17101101',
                GrantNbr: 'NOT-RELEVANT'
            })
            currencyItems.push({
                ItemnoAcc: `${itemNoCounter}`,
                Currency: localCurrency.iso,
                CurrType: '',
                CurrencyIso: '',
                AmtDoccur: `${payment.costCenterPayAmount}`,
                ExchRate: '1'
            })

            glItems.push({
                ItemnoAcc: `${itemNoCounter + 1}`,
                GlAccount: payment.payTypeCreditAccountCode,
                ItemText: payment.description,
                PstngDate: `${now}`,
                ValueDate: `${now}`,
                FmArea: '1000',
                TaxCode: 'V0',
                Costcenter: costCenterCode,
                Orderid: '',
                Fund: `10000000`,
                FundsCtr: '17101101',
                GrantNbr: 'NOT-RELEVANT'
            })
            currencyItems.push({
                ItemnoAcc: `${itemNoCounter + 1}`,
                Currency: localCurrency.iso,
                CurrType: '',
                CurrencyIso: '',
                AmtDoccur: `${payment.costCenterPayAmount}`,
                ExchRate: '1'
            })
            itemNoCounter += 2
        })
    })

    const journal = {
        Accountgl: {'item': glItems},
        Currencyamount: {'item': currencyItems},
        Documentheader: documentHeader,
        Return: {
            'item': [{
                Type: 'S',
                Id: 'String 743',
                Message: 'String 745',
                LogNo: 'String 746',
                LogMsgNo: '747',
                MessageV1: 'String 748',
                MessageV2: 'String 748',
                MessageV3: 'String 748',
                MessageV4: 'String 748',
                Row: '753',
                Field: 'String 754',
                System: 'String 755'
            }]
        }
    }
    return journal;
  }
}

HanaIntegrationHelper.getDetailedPayrunResultForEmployee = (employeeId, detailedPayrunResults) => {
    return _.find(detailedPayrunResults, (aDetailedPayrunResult) => {
        return aDetailedPayrunResult.employeeId === employeeId
    })
}

HanaIntegrationHelper.getTaxForBulkSum = function (employeeDetailedPayrunResult, currencyRatesForPeriod, localCurrency) {
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
 * @param {Object} sapHanaConfig - the SAP config for the business
 * @param {Array} payRunResults -
 * @return {Object, Object, Array} Bulksum for units, Bulksum for projects, Array of employees that contribute to bulksum
 */
HanaIntegrationHelper.processPayrunResultsForSap = function (businessUnitSapConfig, payRunResults, period, localCurrency) {
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
        let isPostedToSAPHANA = aPayrunResult.isPostedToSAPHANA
        if(isPostedToSAPHANA && isPostedToSAPHANA === true) {
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
                unitsBulkSum[unitId]['costCenterCode'] = sapUnitCostCenterDetails.costCenterCode.padStart(10, "0");
                unitsBulkSum[unitId]['payments'] = []
            }
            let unitToWorkWith = unitsBulkSum[unitId]
            let unitBulkSumPayments = unitToWorkWith.payments
            //--
            let employeeDetailedPayrunResult = HanaIntegrationHelper.getDetailedPayrunResultForEmployee(employeeId, detailedPayRunResults);

            aPayrunResult.payment.forEach(aPayment => {
                if(aPayment && aPayment.id) {
                    let payTypeFullDetails = _.find(allPaytypes, function (aPayType) {
                        return (aPayType._id && (aPayType._id === aPayment.id));
                    })
                    //--
                    if(payTypeFullDetails) {
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
                                    taxOrPensionAmount = HanaIntegrationHelper.getTaxForBulkSum(employeeDetailedPayrunResult, currencyRatesForPeriod, localCurrency)
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
                    // let paymentProjectsPay = aPayment.projectsPay || []
                    // paymentProjectsPay.forEach(aProjectPay => {
                    //     let payTypeProjectDebitAccountCode = null
                    //     let payTypeProjectCreditAccountCode = null
                    //     //--
                    //     // if (sapPayTypeDetails.payTypeProjectDebitAccountCode) {
                    //     if (sapPayTypeDetails.payTypeDebitAccountCode) {
                    //         payTypeProjectDebitAccountCode = sapPayTypeDetails.payTypeDebitAccountCode
                    //     } else {
                    //         status = false
                    //         errors.push(`Paytype: ${aPayment.description} does not have an SAP Debit G/L account`)
                    //     }
                    //     // if (sapPayTypeDetails.payTypeProjectCreditAccountCode) {
                    //     if (sapPayTypeDetails.payTypeCreditAccountCode) {
                    //         payTypeProjectCreditAccountCode = sapPayTypeDetails.payTypeCreditAccountCode
                    //     } else {
                    //         status = false
                    //         errors.push(`Paytype: ${aPayment.description} does not have an SAP Credit G/L account`)
                    //     }
                    //     //--
                    //     if(!payTypeProjectDebitAccountCode || !payTypeProjectCreditAccountCode) {
                    //         return
                    //     }
                    //     //--
                    //     let projectName = ''
                    //     let projectData = _.find(allProjects, (project) => {
                    //         return (project._id === aProjectPay.projectId)
                    //     })
                    //     if(projectData) {
                    //         projectName = projectData.name
                    //     } else {
                    //         status = false
                    //         errors.push(`A project which exists for payrun does not exist on the BulkPay system`)
                    //     }
                    //     //--
                    //     if(!projectsBulkSum[aProjectPay.projectId]) {
                    //         projectsBulkSum[aProjectPay.projectId] = {}

                    //         let sapUnitProjectDetails = _.find(businessUnitSapConfig.projects, (aProject) => {
                    //             return (aProject.projectId === aProjectPay.projectId)
                    //         })
                    //         if(!sapUnitProjectDetails  || 
                    //             (!sapUnitProjectDetails.projectSapCode || sapUnitProjectDetails.projectSapCode.length === 0)) {
                    //             status = false
                    //             if(projectData) {
                    //                 errors.push(`Project: ${projectName} does not have an SAP project code`)
                    //             } else {
                    //                 errors.push(`A project does not have an SAP project code`)
                    //             }
                    //             return
                    //         }
                    //         projectsBulkSum[aProjectPay.projectId]['projectSapCode'] = sapUnitProjectDetails.projectSapCode.padStart(10, "0");
                    //         projectsBulkSum[aProjectPay.projectId]['payments'] = []
                    //     }
                    //     let projectInBulkSum = projectsBulkSum[aProjectPay.projectId]
                    //     let projectBulkSumPayments = projectInBulkSum.payments

                    //     let projectPaymentToAccumulate = _.find(projectBulkSumPayments, (aProjectPayment) => {
                    //         return aProjectPayment.payTypeId === aPayment.id
                    //     })
                    //     if(projectPaymentToAccumulate) {
                    //         if(aProjectPay.payAmount === null || isNaN(aProjectPay.payAmount)) {
                    //             aProjectPay.payAmount = 0
                    //         }
                    //         projectPaymentToAccumulate.projectPayAmount += aProjectPay.payAmount
                    //     } else {
                    //         if(aProjectPay.payAmount === null || isNaN(aProjectPay.payAmount)) {
                    //             aProjectPay.payAmount = 0
                    //         }

                    //         projectBulkSumPayments.push({
                    //             payTypeId: aPayment.id,
                    //             projectPayAmount: aProjectPay.payAmount, 
                    //             description: shortenMemoForSapJournalEntry(aPayment.description, " (Project: ", projectData.name),
                    //             payTypeProjectDebitAccountCode: payTypeProjectDebitAccountCode,
                    //             payTypeProjectCreditAccountCode: payTypeProjectCreditAccountCode
                    //         })
                    //     }
                    // })
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
*  SuccessFactors Integration Methods
*/
Meteor.methods({
    // 'hanaIntegration/testConnection': function (businessId, hanaConfig) {
    //     if (!this.userId) {
    //         throw new Meteor.Error(401, "Unauthorized");
    //     }
    //     this.unblock()
    //     //--
    //     if(hanaConfig) {
    //         //http://34.232.137.239:8000/JournalEntryOdataService/journalentry.xsodata?$metadata&$format=json
    //         //   let connectionUrl = `${hanaConfig.protocol}://${hanaConfig.serverHostUrl}/JournalEntryOdataService/journalentry.xsodata?$metadata&$format=json`

    //         const baseUrl = `${hanaConfig.protocol}://${hanaConfig.serverHostUrl}`
    //         const connectionUrl = `${baseUrl}/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=1&$format=json`

    //         const requestHeaders = HanaIntegrationHelper.getAuthHeader(hanaConfig)

    //         let errorResponse = null
    //         try {
    //             let connectionTestResponse = HTTP.call('GET', connectionUrl, {headers: requestHeaders});
    //             // console.log(`connectionTestResponse: `, connectionTestResponse)

    //             if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
    //                 let config = SapHanaIntegrationConfigs.findOne({businessId: businessId});
    //                 if(config) {
    //                     SapHanaIntegrationConfigs.update(config._id, {$set : hanaConfig});
    //                 } else {
    //                     hanaConfig.businessId = businessId
    //                     SapHanaIntegrationConfigs.insert(hanaConfig)
    //                 }
    //                 return '{"status": true, "message": "All good here!"}'
    //             } else {
    //                 errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
    //             }
    //         } catch(e) {
    //             console.log(`Error: `, e)
    //             errorResponse = `{"status": false, "message": "${e.message}"}`
    //         }
    //         return errorResponse;
    //     } else {
    //         return '{"status": false, "message": "Successfactors Config empty"}'
    //     }
    // },
    // 'hanaIntegration/fetchGlAccounts': function (businessUnitId) {
    //     if (!this.userId) {
    //         throw new Meteor.Error(401, "Unauthorized");
    //     }
    //     this.unblock();

    //     let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
    //     if(config) {
    //         const requestHeaders = HanaIntegrationHelper.getAuthHeader(config)
    //         const baseUrl = `${config.protocol}://${config.serverHostUrl}`
    //         const glAccountsQueryUrl = `${baseUrl}/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=300&$format=json`
    //         //   http://34.232.137.239:8000/JournalEntryOdataService/journalentry.xsodata/GLAccounts?$top=300&$format=json

    //         let getToSync = Meteor.wrapAsync(HTTP.get);
    //         const glAccountsRes = getToSync(glAccountsQueryUrl, {headers: requestHeaders})

    //         if(glAccountsRes) {
    //             try {
    //                 let glAccountsData = JSON.parse(glAccountsRes.content)
    //                 return HanaIntegrationHelper.getOdataResults(glAccountsData)
    //             } catch(e) {
    //                 console.log('Error in Getting Hana G/L Accounts! ', e.message)
    //             }
    //         } else {
    //             console.log('Error in Getting Hana G/L Accounts! null response')
    //         }
    //     }
    //   return []
    // },
    "hanaIntegration/updatePayTypeGlAccountCodes": function(businessUnitId, payTypesGLAccountCodesArray, 
        taxesGLAccountCodesArray, pensionGLAccountCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        //--
        if(payTypesGLAccountCodesArray && payTypesGLAccountCodesArray.length > 0) {
            let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId});
            if(config) {
                SapHanaIntegrationConfigs.update(config._id, 
                {$set : {
                    payTypes: payTypesGLAccountCodesArray,
                    taxes: taxesGLAccountCodesArray,
                    pensions: pensionGLAccountCodesArray
                }});
            } else {
                SapHanaIntegrationConfigs.insert({
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
    'hanaIntegration/postPayrunResults': function (businessUnitId, period, month, year) {
        console.log(`Inside hana postPayrunResults`)
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()

        let errorResponse = null
        try {
            let payRunResult = Payruns.find({period: period, businessId: businessUnitId}).fetch();
            let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
            // console.log(`config: `, config)

            if(!config) {
                return {
                    "status": false,
                    "message": "Your company's SAP HANA integration setup has not been done"
                }
            }
            let user = Meteor.user();
            let tenantId = user.group;
            let tenant = Tenants.findOne(tenantId)        
            let localCurrency = {}
            if (tenant) {
                localCurrency = tenant.baseCurrency;
            }
            console.log(`localCurrency: `, localCurrency)

            // let processingResult = HanaIntegrationHelper.processPayrunResultsForSap(config, payRunResult, period, localCurrency)
            // console.log(`processingResult: ${JSON.stringify(processingResult)}`)
            let costCenterCode = '0017101101';
            let processingResult = {
                status: true,
                employees: ['', '', ''],
                unitsBulkSum: {
                    "xyx": {
                        costCenterCode: '0017101101',
                        payments: [
                            {
                                payTypeDebitAccountCode: '0063005000',
                                payTypeCreditAccountCode: '0011001010',
                                description: "BASIC PAY",
                                Costcenter: costCenterCode,
                                costCenterPayAmount: `4000000`,
                            }
                        ]
                    }
                }
              }
              console.log(`processingResult: `, processingResult)

            //   Meteor.bindEnvironment(function (error, result) {
            //     const journalEntryPost = HanaIntegrationHelper.getJournalPostData(processingResult, period, month, year, localCurrency)
            //     console.log(`journalEntryPost: `, journalEntryPost)
  
            //     let createClientSync = Meteor.wrapAsync(soap.createClient);
            //     const client = createClientSync(sapHanaWsdl, { wsdl_headers: authHeaders })
            //     client.setEndpoint(GLPostEndpoint)
  
            //     const accountPostSync = Meteor.wrapAsync(client.AccDocumentPost1)
            //     const errAndResult = accountPostSync(journalEntryPost)
            //     console.log(`errAndResult: `, errAndResult)
            //   })

            //   return 'All done!'


            if(processingResult.status === true) {
                if(processingResult.employees.length > 0) {
                    const authHeaders = HanaIntegrationHelper.getAuthHeader({
                        username: 'SAP_INSTALL', password: 'Awnkg0akm'
                    })

                    const journalEntryPost = HanaIntegrationHelper.getJournalPostData(processingResult, period, month, year, localCurrency)

                    // soap.createClient(sapHanaWsdl, { wsdl_headers: authHeaders }, function(err, client) {
                    //     console.log(`err: `, err);
                    //     console.log(`client: `, client)
                    // });

                    // let createClientSync = Meteor.wrapAsync(soap.createClientAsync);
                    // const client = createClientSync(sapHanaWsdl, { wsdl_headers: authHeaders })
                    // client.setEndpoint(GLPostEndpoint)

                    // const accountPostSync = Meteor.wrapAsync(client.AccDocumentPost1)
                    // const errAndResult = accountPostSync(journalEntryPost)
                    // console.log(`errAndResult: `, errAndResult)

                    return soap.createClientAsync(sapHanaWsdl, { wsdl_headers: authHeaders })
                    .then(client => {
                        client.setEndpoint(GLPostEndpoint)
                        console.log(`About to post journal entry`)
        
                        return client.AccDocumentPost1(journalEntryPost, function(err, result, rawResponse, soapHeader, rawRequest) {
                            console.log(`err: `, err)
                            console.log(`result: `, JSON.stringify(result, null, 4))
                            if(result.statusCode === 500) {
                                console.log(`Severe server error`)
                            }
                            return result
                        })
                    }).catch(error => {
                        console.log(`Soap Error: `, error)
                    })
                }
            }
        } catch(e) {
            errorResponse = `{"status": false, "message": "${e.message}"}`
        }
        return errorResponse;
    }
})
