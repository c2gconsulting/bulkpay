import _ from 'underscore';
import { HTTP } from 'meteor/http'

/**
 *  SAP B1 Integration Methods
 */
Meteor.methods({
    'sapB1integration/testConnection': (businessUnitId, sapConfig) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        //--
        if(sapConfig) {
          console.log(`Business unit id: ${businessUnitId} sap-server-ip: ${sapConfig.ipAddress}`)
          let connectionUrl = `http://${sapConfig.ipAddress}:19080/api/connectiontest`

          let postData = JSON.stringify({companyDatabaseName: sapConfig.companyDatabaseName})
          let requestHeaders = {'Content-Type': 'application/json'}

          try {
              let connectionTestResponse = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});
              if(connectionTestResponse) {
                  console.log(`connectionTestResponse: ${JSON.stringify(connectionTestResponse)}`)
                  if(connectionTestResponse.content && connectionTestResponse.content.status === true) {
                      BusinessUnits.update(businessUnitId, {$set: {sapConfig: sapConfig}})
                  }
                  return connectionTestResponse.content;
              } else {
                  return {status: false, message: `Error in testing connection`}
              }
          } catch(e) {
              console.log(`Error in testing connection! ${e.messagee}`)
              return {status: false, message: "An error occurred in testing connection. Please be sure of the details."}
          }
        } else {
            return {status: false, message: "SAP Config empty"}
        }
    },
    'sapB1integration/postPayrunResults': (payRunResult, period, sapServerIpAddress) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        let connectionUrl = `http://${sapServerIpAddress}:19080/api/payrun`
        let postData = JSON.stringify({period: period, data: payRunResult})
        let requestHeaders = {'Content-Type': 'application/json'}

        try {
            HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders}, (error, result) => {
                if (!error) {
                    console.log(`Payrun batch result: \n${JSON.stringify(result)}`)

                }
            });
        } catch(e) {
            console.log(`Error in posting payrun results to SAP! ${e.messagee}`)
            return {isSuccessful: false, message: "Error in posting payrun results to SAP"}
        }
    }
});
