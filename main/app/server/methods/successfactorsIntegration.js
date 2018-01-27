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

        let companyId = successFactorsConfig.companyId;
        let username = successFactorsConfig.username;
        let password = successFactorsConfig.password;

        let fullUsername = `${username}@${companyId}`
        const authenticationToken = new Buffer(`${fullUsername}:${password}`).toString('base64')

        let requestHeaders = {
            Authorization: `Basic ${authenticationToken}`
        }

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
          return '{"status": false, "message": "SAP Config empty"}'
      }
  }
})