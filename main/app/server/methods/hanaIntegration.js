
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
  }
}


/**
*  SuccessFactors Integration Methods
*/
Meteor.methods({
'hanaIntegration/testConnection': function (businessId, hanaConfig) {
    if (!this.userId) {
        throw new Meteor.Error(401, "Unauthorized");
    }
    this.unblock()
    //--
    if(hanaConfig) {
      let connectionUrl = `${hanaConfig.protocol}://${hanaConfig.serverHostUrl}/odata/v2/$metadata`
      const requestHeaders = HanaIntegrationHelper.getAuthHeader(hanaConfig)

      let errorResponse = null
      try {
          let connectionTestResponse = HTTP.call('GET', connectionUrl, {headers: requestHeaders});
          // console.log(`connectionTestResponse: `, connectionTestResponse)

          if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
              let config = SapHanaIntegrationConfigs.findOne({businessId: businessId});
              if(config) {
                SapHanaIntegrationConfigs.update(config._id, {$set : hanaConfig});
              } else {
                hanaConfig.businessId = businessId
                SapHanaIntegrationConfigs.insert(hanaConfig)
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
  }
})