let soap = require('soap');
Future = Npm.require('fibers/future');


let sapHanaWsdl = "https://sandbox.hsdf.systems:8001/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/post_gl_1/215/post_gl/post_gl?sap-client=215"
let GLPostEndpoint = "https://sandbox.hsdf.systems:8001/sap/bc/srt/rfc/sap/post_gl_1/215/post_gl/post_gl"


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

const HanaIntegration = {
  getAuthHeader: (sfConfig) => {
      const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
      const password = sfConfig.password
      const authToken = new Buffer(`${username}:${password}`).toString('base64')
    
      return {Authorization: `Basic ${authToken}`}
  },
  getOdataResults: (odataResponse) => {
      if(odataResponse && odataResponse.d && odataResponse.d.results 
          && odataResponse.d.results.length > 0) {
          return odataResponse.d.results
      } else {
          return []
      }
  },
    getWeekDays(startDate, endDate) {
        let startDateMoment = moment(startDate)
        let endDateMoment = moment(endDate)

        let numberOfDays = endDateMoment.diff(startDateMoment, 'days') + 1

        let startDateMomentClone = moment(startDateMoment); // use a clone
        let weekDates = []

        while (numberOfDays > 0) {
            if (startDateMomentClone.isoWeekday() !== 6 && startDateMomentClone.isoWeekday() !== 7) {
                weekDates.push(moment(startDateMomentClone).toDate())  // calling moment here cos I need a clone
            }
            startDateMomentClone.add(1, 'days');
            numberOfDays -= 1;
        }
        return weekDates
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
    let costCentersBulkSum = processingResult.costCentersBulkSum
    let costCenters = Object.keys(costCentersBulkSum)

    let itemNoCounter = 1
    costCenters.forEach(costCenterCode => {
        const payments = costCentersBulkSum[costCenterCode].payments;

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

HanaIntegration.getEmpPayresults = (employeeId, detailedPayrunResults) => {
    return _.find(detailedPayrunResults, (aDetailedPayrunResult) => {
        return aDetailedPayrunResult.employeeId === employeeId
    })
}

HanaIntegration.getTaxForBulkSum = function (empPayResult, currencyRatesForPeriod, localCurrency) {
    let deductionPayments = empPayResult.payslipWithCurrencyDelineation.deduction;
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
HanaIntegration.processPayrun = function (businessUnitSapConfig, businessUnitId, period, localCurrency) {
    let costCentersBulkSum = {}
    let arrayOfEmployees = []
    let status = true
    let errors = []

    let allPaytypes = PayTypes.find({businessId: businessUnitId}).fetch();
    let allTaxes = Tax.find({businessId: businessUnitId}).fetch()
    let allProjects = Projects.find({businessId: businessUnitId}).fetch()

    let payRunResults = Payruns.find({period: period, businessId: businessUnitId}).fetch();
    let detailedPayRunResults = PayResults.find({period: period, businessId: businessUnitId}).fetch();

    let currencyRatesForPeriod = Currencies.find({businessId: businessUnitId, period: period}).fetch()
    const businessConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
    //--
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

    let periodMonth = period.substring(0, 2);
    let periodYear = period.substring(2)

    const firsDayOfPeriod = `${periodMonth}-01-${periodYear} GMT`;
    const startDate = moment(new Date(firsDayOfPeriod)).startOf('month').toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    const numWeekDays = HanaIntegration.getWeekDays(startDate, endDate).length;


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
        try {        
            let queryObj = {
                businessId: businessUnitId, 
                day: {$gte: startDate, $lt: endDate},
                employeeId: employeeId,
                // status: 'Approved'
            }
        
            const empTimeSheet = TimeWritings.aggregate([
                { $match: queryObj},
                { $group: {
                  _id: "$successFactorsCostCenter",
                  duration: { $sum: "$duration" }
                } }
            ]);
            let totalDuration = 0;
            empTimeSheet.forEach(time => {
                if(time.successFactorsCostCenter && !costCentersBulkSum[time.successFactorsCostCenter]) {
                    costCentersBulkSum[time.successFactorsCostCenter] = {}
                    costCentersBulkSum['costCenterCode'] = time.successFactorsCostCenter.padStart(10, "0");
                    costCentersBulkSum['payments'] = []
                }

                totalDuration += time.duration
            })
            console.log(`totalDuration: `, totalDuration)
            console.log(`empTimeSheet: `, empTimeSheet)

            // let unitToWorkWith = unitsBulkSum[unitId]
            // let unitBulkSumPayments = unitToWorkWith.payments
            // //--
            let employeeDetailedPayrunResult = HanaIntegration.getEmpPayresults(employeeId, detailedPayRunResults);

            aPayrunResult.payment.forEach(aPayment => {
                if(aPayment && aPayment.id) {
                    let payTypeFullDetails = _.find(allPaytypes, function (aPayType) {
                        return (aPayType._id && (aPayType._id === aPayment.id));
                    })
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

                                let taxOrPensionAmount = 0
                                if(aPayment.reference === 'Tax') {
                                    taxOrPensionAmount = HanaIntegration.getTaxForBulkSum(employeeDetailedPayrunResult, currencyRatesForPeriod, localCurrency)
                                } else {
                                    taxOrPensionAmount = aPayment.amountLC || 0
                                }

                                if(numWeekDays > 0 && totalDuration > 0) {
                                    empTimeSheet.forEach(time => {
                                        const tSfCc = time._id;
                                        if(time.duration > 0) {
                                            const amountForCostCenter = 
                                                (time.duration / totalDuration) * (totalDuration/(numWeekDays * businessConfig.maxHoursInDayForTimeWriting))
                                                    * taxOrPensionAmount

                                            if(tSfCc) {
                                                let description = ''
                                                if(aPayment.reference === 'Tax') {
                                                    description = shortenMemoForSapJournalEntry(aPayment.description, " (Cost-Center: ", tSfCc)
                                                } else {
                                                    description = shortenMemoForSapJournalEntry(aPayment.code, " (Cost-Center: ", tSfCc)
                                                }

                                                if(!costCentersBulkSum[tSfCc]) {
                                                    costCentersBulkSum[tSfCc] = {}
                                                    costCentersBulkSum[tSfCc].payments = []
    
                                                    costCentersBulkSum[tSfCc].payments.push({
                                                        payTypeId: aPayment.id,
                                                        costCenterPayAmount: amountForCostCenter,
                                                        description: description,
                                                        payTypeDebitAccountCode: payTypeDebitAccountCode,
                                                        payTypeCreditAccountCode: payTypeCreditAccountCode,
                                                    })
                                                } else {
                                                    let gotPay = _.find(costCentersBulkSum[tSfCc].payments, pay => {
                                                        return pay.payTypeId === aPayment.id
                                                    })
                                                    if(gotPay) {
                                                        gotPay.costCenterPayAmount += amountForCostCenter
                                                    } else {
                                                        costCentersBulkSum[tSfCc].payments.push({
                                                            payTypeId: aPayment.id,
                                                            costCenterPayAmount: amountForCostCenter,
                                                            description: description,
                                                            payTypeDebitAccountCode: payTypeDebitAccountCode,
                                                            payTypeCreditAccountCode: payTypeCreditAccountCode,
                                                        })
                                                    }
                                                }
                                            }
                                        }
                                    })
                                }
                            }
                        } else {
                            return
                        }
                    } else {
                        if (sapPayTypeDetails.payTypeDebitAccountCode) {
                            payTypeDebitAccountCode = sapPayTypeDetails.payTypeDebitAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP HANA Debit G/L account`)
                        }
                        if (sapPayTypeDetails.payTypeCreditAccountCode) {
                            payTypeCreditAccountCode = sapPayTypeDetails.payTypeCreditAccountCode
                        } else {
                            status = false
                            errors.push(`Paytype: ${aPayment.description} does not have an SAP HANA Credit G/L account`)
                        }
                        if(!payTypeDebitAccountCode || !payTypeDebitAccountCode) {
                            return
                        }
                        if (sapPayTypeDetails.payTypeDebitAccountCode && sapPayTypeDetails.payTypeCreditAccountCode) {                            
                            if(numWeekDays > 0 && totalDuration > 0) {
                                empTimeSheet.forEach(time => {
                                    const tSfCc = time._id;
                                    if(tSfCc) {
                                        let description = shortenMemoForSapJournalEntry(aPayment.code, " (Cost-Center: ", tSfCc)
                                        // console.log(`aPayment.amountLC: `, aPayment.amountLC)
                                        // console.log(`time.duration: `, time.duration)
                                        // console.log(`totalDuration: `, totalDuration)
                                        // console.log(`numWeekDays: `, numWeekDays)
                                        
                                        const amountForCostCenter = 
                                            (time.duration / totalDuration) * (totalDuration/(numWeekDays * businessConfig.maxHoursInDayForTimeWriting))
                                                * (aPayment.amountLC || 0)
                                        // console.log(`amountForCostCenter: `, amountForCostCenter)

                                        if(!costCentersBulkSum[tSfCc]) {
                                            if(time.duration > 0 ) {
                                                costCentersBulkSum[tSfCc] = {}
                                                costCentersBulkSum[tSfCc].payments = []
    
                                                costCentersBulkSum[tSfCc].payments.push({
                                                    payTypeId: aPayment.id,
                                                    costCenterPayAmount: amountForCostCenter,
                                                    description: description,
                                                    payTypeDebitAccountCode: payTypeDebitAccountCode,
                                                    payTypeCreditAccountCode: payTypeCreditAccountCode,
                                                })                
                                            }
                                        } else {
                                            let gotPay = _.find(costCentersBulkSum[tSfCc].payments, pay => {
                                                return pay.payTypeId === aPayment.id
                                            })
                                            if(gotPay) {
                                                gotPay.costCenterPayAmount += amountForCostCenter
                                                console.log(`gotPay.costCenterPayAmount: `, gotPay.costCenterPayAmount)
                                            } else {
                                                costCentersBulkSum[tSfCc].payments.push({
                                                    payTypeId: aPayment.id,
                                                    costCenterPayAmount: amountForCostCenter,
                                                    description: description,
                                                    payTypeDebitAccountCode: payTypeDebitAccountCode,
                                                    payTypeCreditAccountCode: payTypeCreditAccountCode,
                                                })
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            })
            arrayOfEmployees.push(employeeId)                            
        } catch(ex) {
            status = false
            errors.push(`${ex.message}`)
        }
    }

    console.log(`Number of employees affected: ${arrayOfEmployees.length}`)
    if(status) {
        return {status, costCentersBulkSum, employees: arrayOfEmployees}
    } else {
        return {status, errors}
    }
}


/**
*  SuccessFactors Integration Methods
*/
Meteor.methods({
    "hanaIntegration/updateUnitCostCenters": function(businessUnitId, unitCostCenterCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()
        //--
        if(unitCostCenterCodesArray && unitCostCenterCodesArray.length > 0) {
            unitCostCenterCodesArray.forEach(unit => {
                unit.successFactors = unit.successFactors || {}
                unit.successFactors.costCenter = unit.successFactors.costCenter || {}
                unit.successFactors.costCenter.code = unit.successFactors.costCenter.code || ""
                
                EntityObjects.update({_id: unit._id}, {$set: {
                    'successFactors.costCenter.code': unit.successFactors.costCenter.code
                }})
            })
            return true;
        } else {
            throw new Meteor.Error(404, "Empty cost centers data for units");
        }
    },
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
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()
        let future = new Future();

        let errorResponse = null
        try {
            let config = SapHanaIntegrationConfigs.findOne({businessId: businessUnitId})
            if(!config) {
                return {
                    status: false,
                    message: "Your company's SAP HANA integration setup has not been done"
                }
            }
            let user = Meteor.user();
            let tenantId = user.group;
            let tenant = Tenants.findOne(tenantId)        
            let localCurrency = {}
            if (tenant) {
                localCurrency = tenant.baseCurrency;
            }

            let processingResult = HanaIntegration.processPayrun(config, businessUnitId, period, localCurrency)
            console.log(`processingResult: ${JSON.stringify(processingResult)}`)

            if(processingResult.status !== true) {
                future["return"]({status: false, errors: processingResult.errors, message: 'Sorry, could not process payrun for posting'})
                return
            }
            if(processingResult.employees.length < 1) {
                future["return"]({status: false, message: 'No employee payrun to POST'})
                return
            }
            const authHeaders = HanaIntegration.getAuthHeader({
                username: 'SAP_INSTALL', password: 'Awnkg0akm'
            })

            const journalEntryPost = HanaIntegration.getJournalPostData(processingResult, period, month, year, localCurrency)

            soap.createClient(sapHanaWsdl, { wsdl_headers: authHeaders }, Meteor.bindEnvironment(function (error, client) {
                console.log(`error: `, error)
                if(client) {
                    client.setEndpoint(GLPostEndpoint)
                    console.log(`About to post journal entry`)
    
                    try {
                        client.AccDocumentPost1(journalEntryPost, Meteor.bindEnvironment(function (error, result) {
                            console.log(`result: `, JSON.stringify(result, null, 4))
                            if(result.statusCode === 500) {
                                console.log(`Severe server error`)
                            } else {
                                if(result.Return && result.Return.item && result.Return.item.length > 0) {
                                    const returnMessage = result.Return.item[0].Message
                                    console.log(`returnMessage: `, returnMessage)
        
                                    if(returnMessage.indexOf('successfully') > 0) {
                                        const payrunsToUpdate = Payruns.find({
                                            businessId: businessUnitId,
                                            period: period,
                                            employeeId: {$in: processingResult.employees}
                                        }).fetch()
                                        const payrunIds = _.pluck(payrunsToUpdate, '_id')
                                        console.log(`payrunIds: `, payrunIds)

                                        if(payrunIds && payrunIds.length > 0) {
                                            Payruns.update({_id: {$in: payrunIds}}, {$set: {isPostedToSAPHANA: true}})
                                        }
                                    }
                                }
                            }
                            future["return"](result)
                        }))
                    } catch(error) {
                        console.log(`Soap Error: `, error)
                        future["return"]({statusCode: 500})
                    }
                } else {
                    future["return"]({statusCode: 503})
                }
            }));
        } catch(e) {
            errorResponse = `{"status": false, "message": "${e.message}"}`
            future["return"](errorResponse)
        }

        return future.wait()
    }
})
