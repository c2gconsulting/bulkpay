import _ from 'underscore';
import { HTTP } from 'meteor/http'

/**
 *  SAP B1 Integration Methods
 */
Meteor.methods({
    'sapB1integration/testConnectionToWindowsService': (businessUnitId, sapConfig) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        //--
        if(sapConfig) {
          console.log(`Business unit id: ${businessUnitId} sap-server-ip: ${sapConfig.ipAddress}`)
          //let connectionUrl = `http://${sapConfig.ipAddress}:19080/api/connectiontest/${sapConfig.databaseName}`
          let connectionUrl = `http://${sapConfig.ipAddress}:19080/api/connectiontest`

          try {
              HTTP.call('POST', connectionUrl, {ipAddress: ${sapConfig.ipAddress}}, (error, result) => {
                  if (!error) {
                    console.log(`conn status: ${result}`)

                    let connectionStatus = JSON.parse(result)
                    if(connectionStatus && connectionStatus.isSuccessful === true) {
                        BusinessUnits.update(businessUnitId, {$set: {sapConfig: sapConfig}})
                    }
                    return result;
                  } else {
                    return error;
                  }
              });
          } catch(e) {
              console.log(`Error in testing connection${e.messagee}`)
              return {isSuccessful: false, message: "An error occurred in testing connection. Please be sure of the details."}
          }
        } else {
            return {isSuccessful: false, message: "SAP Config empty"}
        }
    },
    'sapB1integration/postPayrunResults': (payRunResult, periodMonth, periodYear, sapServerIpAddress) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        let postData = JSON.stringify(payRunResult)
        postData = "=" + postData;       // A quirk of the C# REST API on the windows service

        try {
            HTTP.call('POST', `http://${sapServerIpAddress}:19080/api/payrun`, {data: postData}, (error, result) => {
                if (!error) {
                    console.log(`Payrun batch result: \n${JSON.stringify(result)}`)

                }
            });
        } catch(e) {
            console.log(`Error in testing connection${e.messagee}`)
            return {isSuccessful: false, message: "An error occurred in testing connection. Please be sure of the details."}
        }
    }
});
