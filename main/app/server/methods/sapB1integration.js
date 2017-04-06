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
          let errorResponse = null
          try {
              let connectionTestResponse = HTTP.call('POST', connectionUrl, {data: postData, headers: requestHeaders});

              let actualServerResponse = connectionTestResponse.data.replace(/\//g, "")
              actuaServerResponse = JSON.parse(actualServerResponse)

              if(actualServerResponse.status === true) {
                  // BusinessUnits.update(businessUnitId, {$set: {sapConfig: sapConfig}})
              } else {
                  console.log(`Apparently the connection test response status is NOT true`)
              }
              return actualServerResponse.replace(/\//g, "")
          } catch(e) {
              console.log(`Error in testing connection! ${e.messagee}`)
              errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
          }
          if(errorResponse)
              return errorResponse;
        } else {
            return '{"status": false, "message": "SAP Config empty"}'
        }
    },
    "sapB1integration/updateUnitsGlAccounts": function(businessUnitId, unitGlAccountsArray){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);

        //--
        if(unitGlAccountsArray && unitGlAccountsArray.length > 0) {
            let businessUnitSapConfig = SapBusinessUnitConfigs.findOne({businessUnitId: businessUnitId});
            if(businessUnitSapConfig) {
                SapBusinessUnitConfigs.update({_id : businessUnitSapConfig._id}, {$set : {units: unitGlAccountsArray}});
            } else {
                SapBusinessUnitConfigs.insert({businessUnitId: businessUnitId, units: unitGlAccountsArray})
            }
        } else {
            throw new Meteor.Error(404, "Empty GL accounts data for units");
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
