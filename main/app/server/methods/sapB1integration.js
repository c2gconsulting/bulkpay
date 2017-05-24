import _ from 'underscore';
import { HTTP } from 'meteor/http'


let SapIntegration = {}

/**
 * Goes through all employee payrun results for the period and accumulates a bulksum for each paytype
 *
 * @param {Object} businessUnitSapConfig - the SAP config for the business
 * @param {Array} payRunResults -
 * @return {Object, Array} Bulksum, Array of employees that contribute to bulksum
 */
SapIntegration.processPayrunResultsForSap = (businessUnitSapConfig, payRunResults) => {
    let unitsBulkSum = {}
    let arrayOfEmployees = []
    let status = true
    let errors = []

    //Be patient. The main processing happens after this function definition
    let initializeUnitBulkSum = (unitId, costCenterCode, aPayrunResult) => {
        unitsBulkSum[unitId] = {}
        unitsBulkSum[unitId]['costCenterCode'] = costCenterCode || ""

        let unitBulkSumPayments = []
        unitsBulkSum[unitId]['payments'] = aPayrunResult.payment.forEach(aPayment => {
            if(aPayment && aPayment.id) {
                let sapPayTypeDetails = _.find(businessUnitSapConfig.payTypes, function (aPayType) {
                    return aPayType.payTypeId === aPayment.id;
                })
                //--
                let payTypeDebitAccountCode = ""
                let payTypeCreditAccountCode = ""
                if (sapPayTypeDetails) {
                    if (sapPayTypeDetails.payTypeDebitAccountCode) {
                        payTypeDebitAccountCode = sapPayTypeDetails.payTypeDebitAccountCode
                    } else {
                        console.log(`sapPayTypeDetails.payTypeDebitAccountCode is NULL`)
                    }
                    if (sapPayTypeDetails.payTypeCreditAccountCode) {
                        payTypeCreditAccountCode = sapPayTypeDetails.payTypeCreditAccountCode
                    } else {
                        console.log(`sapPayTypeDetails.payTypeCreditAccountCode is NULL`)
                    }

                    unitBulkSumPayments.push({
                        payTypeId: aPayment.id,
                        amountLC: aPayment.amountLC,
                        description: aPayment.description,
                        payTypeDebitAccountCode: payTypeDebitAccountCode,
                        payTypeCreditAccountCode: payTypeCreditAccountCode
                    })
                } else {
                    console.log(`sapPayTypeDetails is null. aPayment: ${JSON.stringify(aPayment)}`)
                }
            } else {
               console.log(`This payment has no id: ${JSON.stringify(aPayment)}`)
            }
        })
        unitsBulkSum[unitId]['payments'] = unitBulkSumPayments
    }

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

    //--Main processing happens here
    for(let aPayrunResult of payRunResults) {
        let isPostedToSAP = aPayrunResult.isPostedToSAP
        if(isPostedToSAP && isPostedToSAP === true) {
            // console.log(`isPostedToSAP is true`)
            return
        }
        let employeeId = aPayrunResult.employeeId
        let employee = Meteor.users.findOne({_id: employeeId})

        if(!employee) {
            // console.log(`employee data could not be found`)
            status = false
            error.push(`An employee record for payrun could not be found`)
        }
        let employeePositionId = employee.employeeProfile.employment.position
        let position = EntityObjects.findOne({_id: employeePositionId, otype: 'Position'})

        try {
            if(!position) {
                // console.log(`Position could not be found: ${employeePositionId}`)
                status = false
                error.push(`Employee: ${employee.profile.fullName} does not have a position`)
            } else {
                let unit = getUnitForPosition(position)
                if(!unit) {
                    // console.log(`Could not find unit for position: ${employeePositionId}`)
                    status = false
                    errors.push(`Employee: ${employee.profile.fullName} does not have a unit`)
                } else {
                    let unitId = unit._id
                    let sapUnitCostCenterDetails = _.find(businessUnitSapConfig.units, (aUnit) => {
                        return aUnit.unitId === unitId;
                    })
                    if(sapUnitCostCenterDetails) {
                        let unitToWorkWith = unitsBulkSum[unitId]
                        if(unitToWorkWith) {
                            aPayrunResult.payment.forEach(aPayment => {
                                let paymentToAccumulate = _.find(unitToWorkWith.payments, (aUnitPayment) => {
                                    return aUnitPayment.payTypeId === aPayment.id
                                })
                                if(paymentToAccumulate) {
                                    paymentToAccumulate.amountLC += aPayment.amountLC
                                }
                            })
                            arrayOfEmployees.push(employeeId)
                        } else {
                            if(sapUnitCostCenterDetails.costCenterCode && sapUnitCostCenterDetails.costCenterCode.length > 0) {
                                initializeUnitBulkSum(unitId, sapUnitCostCenterDetails.costCenterCode, aPayrunResult)
                                arrayOfEmployees.push(employeeId)
                            } else {
                                status = false
                                errors.push(`Unit: ${unit.name} does not have cost center`)
                            }
                        }
                    } else {
                        // console.log(`sapUnitCostCenterDetails: ${JSON.stringify(sapUnitCostCenterDetails)}`)
                        status = false
                        errors.push(`Unit: ${unit.name} does not have cost center`)
                    }
                }
            }
        } catch(ex) {
            console.log(`processPayrunResultsForSap error: ${ex.message}`)
            status = false
            errors.push(`${ex.message}`)
        }
    }

    //console.log(`Number of employees affected: ${arrayOfEmployees.length}`)
    if(status) {
        return {status, unitsBulkSum, employees: arrayOfEmployees}
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
    "sapB1integration/updatePayTypeGlAccountCodes": function(businessUnitId, payTypesGLAccountCodesArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        //--
        if(payTypesGLAccountCodesArray && payTypesGLAccountCodesArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update(businessUnitSapConfig._id, {$set : {payTypes: payTypesGLAccountCodesArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessId: businessUnitId, payTypes: payTypesGLAccountCodesArray})
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
            let payRunResult = Payruns.find({period: period}).fetch();
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessId: businessUnitId})

            if(!businessUnitSapConfig) {
                return JSON.stringify({
                    "status": false,
                    "message": "Your company's sap integration setup has not been done"
                })
            }
            let processingResult = SapIntegration.processPayrunResultsForSap(businessUnitSapConfig, payRunResult)
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

                        data: processingResult.unitsBulkSum
                    })
                    let requestHeaders = {'Content-Type': 'application/json'}

                    let serverRes = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
                    let actualServerResponse = serverRes.data.replace(/\//g, "")

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
                                console.log(`Could not find payrunDoc`)
                            }
                        })
                        console.log(`Payrun post to SAP was successful`)
                    }
                    return actualServerResponse.replace(/\//g, "")
                } else {
                    return JSON.stringify({"status": false, "message": "There are no employee payments to post to SAP"})
                }
            } else {
                return JSON.stringify(processingResult)
            }
        } catch(e) {
            console.log(`Error in testing connection! ${e.message}`)
            errorResponse = '{"status": false, "message": "An error occurred in posting payrun results."}'
        }
        return errorResponse;
    }
});
