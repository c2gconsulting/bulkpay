
const SFIntegrationHelper = {
    getAuthHeader: (sfConfig) => {
        const companyId = sfConfig.companyId
        const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        const password = sfConfig.password
      
        let fullUsername = `${username}@${companyId}`
        const authenticationToken = new Buffer(`${fullUsername}:${password}`).toString('base64')
      
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
    }
}


/**
 *  SuccessFactors Integration Methods
 */
Meteor.methods({
  'successfactorsIntegration/testConnection': function (businessId, successFactorsConfig) {
      if (!this.userId) {
          throw new Meteor.Error(401, "Unauthorized");
      }
      this.unblock()
      //--
      if(successFactorsConfig) {
        let connectionUrl = `${successFactorsConfig.protocol}://${successFactorsConfig.odataDataCenterUrl}/odata/v2/$metadata`
        const requestHeaders = SFIntegrationHelper.getAuthHeader(successFactorsConfig)

        let errorResponse = null
        try {
            let connectionTestResponse = HTTP.call('GET', connectionUrl, {headers: requestHeaders});
            // console.log(`connectionTestResponse: `, connectionTestResponse)

            if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
                let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessId});
                if(config) {
                    SuccessFactorsIntegrationConfigs.update(config._id, {$set : successFactorsConfig});
                } else {
                    successFactorsConfig.businessId = businessId
                    SuccessFactorsIntegrationConfigs.insert(successFactorsConfig)
                }
                return '{"status": true, "message": "All good here!"}'
            } else {
                errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
            }
        } catch(e) {
            console.log(`Error: `, e)
            errorResponse = `{"status": false, "message": "${e.message}"}`
        }
        return errorResponse;
      } else {
          return '{"status": false, "message": "Successfactors Config empty"}'
      }
    },
    'successfactors/fetchPaytypes': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }  
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foPayComponentQueryUrl = `${baseUrl}/odata/v2/FOPayComponent?$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const payCompRes = getToSync(foPayComponentQueryUrl, {headers: requestHeaders})

            if(payCompRes) {
                try {
                    let payCompData = JSON.parse(payCompRes.content)
                    return SFIntegrationHelper.getOdataResults(payCompData)
                } catch(e) {
                  console.log('Error in Getting SF pay components! ', e.message)
                }
            } else {
                console.log('Error in Getting SF pay components! null response')
            }
        }
        return []
    },
    'successfactors/fetchPayGrades': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }  
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foPayGradeQueryUrl = `${baseUrl}/odata/v2/FOPayGrade?$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const payGradeRes = getToSync(foPayGradeQueryUrl, {headers: requestHeaders})

            if(payGradeRes) {
                try {
                    let payGradeData = JSON.parse(payGradeRes.content)
                    return SFIntegrationHelper.getOdataResults(payGradeData)
                } catch(e) {
                  console.log('Error in Getting SF paygrades! ', e.message)
                }
            } else {
                console.log('Error in Getting SF paygrades! null response')
            }
        }
        return []
    },
    'successfactors/fetchCostCenters': function (businessUnitId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }  
        this.unblock();

        let config = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId})
        if(config) {
            const requestHeaders = SFIntegrationHelper.getAuthHeader(config)
            const baseUrl = `${config.protocol}://${config.odataDataCenterUrl}`
            const foCostCenterUrl = `${baseUrl}/odata/v2/FOCostCenter?$format=json`
          
            let getToSync = Meteor.wrapAsync(HTTP.get);  
            const costCenterRes = getToSync(foCostCenterUrl, {headers: requestHeaders})

            if(costCenterRes) {
                try {
                    let costCenterData = JSON.parse(costCenterRes.content)
                    return SFIntegrationHelper.getOdataResults(costCenterData)
                } catch(e) {
                  console.log('Error in Getting SF paygrades! ', e.message)
                }
            } else {
                console.log('Error in Getting SF paygrades! null response')
            }
        }
        return []
    },
    "successfactors/updateUnitCostCenters": function(businessUnitId, unitCostCenters){
        console.log(`unitCostCenters: `, unitCostCenters)
        if(!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let unitCostCenterCodes = Object.keys(unitCostCenters) || []
        let unitsData = []
        unitCostCenterCodes.forEach(code => {
            const unitCostCenter = unitCostCenters[code]
            unitsData.push(unitCostCenter)
        })

        let sfConfig = SuccessFactorsIntegrationConfigs.findOne({businessId: businessUnitId});
        if(sfConfig) {
            SuccessFactorsIntegrationConfigs.update(sfConfig._id, {$set : {units: unitsData}});
        } else {
            SuccessFactorsIntegrationConfigs.insert({businessId: businessUnitId, units: unitsData})
        }
        return true;
    },
})