import _ from 'underscore';
import { HTTP } from 'meteor/http'

/**
 *  SAP B1 Integration Methods
 */
Meteor.methods({
    'sapB1integration/testConnectionToWindowsService': (sapServerIpAddress) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        this.unblock()

        let connectionStatusResponse = Meteor.http.call("GET", `${sapServerIpAddress}:9080/api/payrun`);
        return connectionStatusResponse
    },
    'sapB1integration/postPayrunResults': (payRunResult, periodMonth, periodYear, sapServerIpAddress) => {
        if (!this.userId && Core.hasPayrollAccess(this.userId)) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        this.unblock()

        // if(sapServerIpAddress.startsWith("http://")) {
        //
        // }
        //--
        let postData = JSON.stringify(payRunResult)
        postData = "=" + postData;       // A quirk of the C# REST API on the windows service

        // HTTP.call('POST', `${sapServerIpAddress}:9080/api/payrun`, {data: postData}, () => (error, result) {
        //     if (!error) {
        //         console.log(`Payrun batch result: \n${JSON.stringify(result)}`)
        //
        //     }
        // });
    }
});
