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
          console.log(`Business unit id: ${businessUnitId} sap-server-ip: ${sapConfig.sapServerIpAddress}`)
          let connectionUrl = `http://${sapConfig.sapServerIpAddress}:${sapConfig.sapServerPort}/api/payrun?dbName:${sapConfig.databaseName}`

          try {
              let connectionStatusResponse = Meteor.http.call("GET", connectionUrl);
              if(connectionStatusResponse && connectionStatusResponse.isSuccessful === true) {
                  BusinessUnits.update(businessUnitId, {$set: {sapServerIpAddress: sapServerIpAddress}})
              }
              return connectionStatusResponse;
          } catch(e) {
              console.log(`Error in testing connection${e.messagee}`)
              return {isSuccessful: false, Message: "An error occurred in testing connection. Please be sure of the details."}
          }
        } else {
            return {isSuccessful: false, Message: "SAP Config empty"}
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
            HTTP.call('POST', `http://${sapServerIpAddress}:9080/api/payrun`, {data: postData}, (error, result) => {
                if (!error) {
                    console.log(`Payrun batch result: \n${JSON.stringify(result)}`)

                }
            });
        } catch(e) {
            console.log(`Error in testing connection${e.messagee}`)
            return {isSuccessful: false, Message: "An error occurred in testing connection. Please be sure of the details."}
        }
    }
});
