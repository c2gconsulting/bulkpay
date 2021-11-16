// const { default: axios } = require("axios");
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
// import { fetch, Headers, Request, Response } from 'meteor/fetch';

// backwards compatibility
if (typeof Meteor.wrapAsync === "undefined") {
  Meteor.wrapAsync = Meteor._wrapAsync;
}

const SHIntegrationHelper = {
  getAuthHeader: (sfConfig) => {
      const username = sfConfig.username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
      const password = sfConfig.password
      // 'Authorization': `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`, 

      const authenticationToken = new Buffer(`${username}:${password}`).toString('base64')
    
      return {
        Authorization: `Basic ${authenticationToken}`
      }
  },
  getAuthData: (sfConfig) => {
      var data = JSON.stringify({
        "employee_number": "",
        // auth: {
        //   username: 'BULKPAY_DEV',
        //   password: 'Passw0rd%%'
        // }
      });
    
      return {
        data
      }
  },
  getOdataResults: (odataResponse) => {
      if(odataResponse && odataResponse.d && odataResponse.d.results 
          && odataResponse.d.results.length > 0) {
          return odataResponse.d.results
      } else {
          return []
      }
  },
  getJsDateFromOdataDate(date) {
      if(date) {
        date = date + ""
        const numChars = date.length;
        const timestamp = date.substring(6, numChars - 2)// /Date(xxxxxxx)/
        console.log(`timestamp: `, timestamp)
        const timestampAsNum = Number(timestamp)

        return new Date(timestampAsNum)
      }
  }
}

function API(address, callback) {
  let lookupAddress = address;
  // short term solution to an haproxy ssl cert installation issue
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  // if we're local, let's let freegeoip guess.
  if (lookupAddress === "" || lookupAddress === null) {
    lookupAddress = "costcenter";
  }
  // calls a private reaction hosted version of freegeoip
  HTTP.call("GET", `https://swapi.dev/api/films`, callback);
}

/**
 * Tenant Methods
 */
Meteor.methods({
  // 'checkEmployeeExistence': (employeeId, businessId) => {
  //   // check(employeeId, String);
  //   // check(businessId, String);
  //   // if(!Core.hasPayrollAccess(this.userId)){
  //   //     throw new Meteor.Error(403, "Access Denied");
  //   // }
  //   let name = Meteor.users.findOne({'employeeProfile.employeeId': employeeId, 'businessIds': businessId});
  //   return name ? {exist: true} : {exist: false};
  // },
  // 'getemp': function (empno) {
  //   check(empno, String);
  //   if(Meteor.isServer){
  //     console.log('making api call to SAP PO for employee ', empno);
  //     fetch('http://20.73.168.4:50000/RESTAdapter/employees', {
  //       method: 'POST', // *GET, POST, PUT, DELETE, etc.
  //       mode: 'cors', // no-cors, *cors, same-origin
  //       cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  //       credentials: 'same-origin', // include, *same-origin, omit
  //       headers: new Headers({
  //         Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
  //         'Content-Type': 'application/json'
  //       }),
  //       redirect: 'follow', // manual, *follow, error
  //       referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  //       body: JSON.stringify({employee_number: empno}) // body data type must match "Content-Type" header
  //     })
  //     .then((result) => {
  //       result.json().then(function(j) {
  //         console.log('getemp- j');
  //         console.log(j);
  //       })
  //     })
  //   }
  // },
  /**
   * Get employee
   * Params Object
   * props PayGrade, Employee
   */

  // createAndUpdateEmployees: function () {
  //   try {
  //     geoAddress = Meteor.wrapAsync(API)('costcenter');
  //     console.log(geoAddress.data)
  //     return geoAddress.data;
  //   } catch (error) {
  //     Core.Log.warn("createAndUpdateEmployees lookup failure", error);
  //     return {};
  //   }
  // },

  'createOrUpdateEmployees': function () {
    this.unblock();

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

    const s4HanaConfig = {
      username: 'BULKPAY_DEV',
      password: 'Passw0rd%%'
    }

    const connectionUrl = 'http://20.73.168.4:50000/RESTAdapter/costcenters';
    const requestHeaders = SHIntegrationHelper.getAuthHeader(s4HanaConfig);
    const data = SHIntegrationHelper.getAuthData();

    let errorResponse = null
    try {
      if (Meteor.isServer) {
        console.log('Making Api calls - Meteor.isServer')
        // let getToSync = Meteor.wrapAsync(HTTP.post, requestHeaders);  
        // const connectionTestResponse = getToSync(connectionUrl)
        let connectionTestResponse = HTTP.call('POST', connectionUrl, { });
        // console.log(`connectionTestResponse: `, connectionTestResponse)

        if(connectionTestResponse && connectionTestResponse.statusCode === 200) {
          console.log('connectionTestResponse', JSON.stringify(connectionTestResponse))
          // let config = S4HanaIntegrationConfigs.findOne({businessId: businessId});
          // if(config) {
          //   S4HanaIntegrationConfigs.update(config._id, {$set : s4HanaConfig});
          // } else {
          //   s4HanaConfig.businessId = businessId
          //   S4HanaIntegrationConfigs.insert(s4HanaConfig)
          // }
          return '{"status": true, "message": "All good here!"}'
        } else {
          errorResponse = '{"status": false, "message": "An error occurred in testing connection. Please be sure of the details."}'
        }
      }
    } catch(e) {
      console.log(`Error: `, e)
      errorResponse = `{"status": false, "message": "${e.message}"}`
    }
    return errorResponse;

    // var data = JSON.stringify({
    //   "employee_number": "",
    //   // auth: {
    //   //   username: 'BULKPAY_DEV',
    //   //   password: 'Passw0rd%%'
    //   // }
    // });
  
    // var config = {
    //   method: 'get',
    //   url: 'http://20.73.168.4:50000/RESTAdapter/employees',
    //   headers: { 
    //     'Authorization': `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`, 
    //     'Content-Type': 'application/json', 
    //     // 'Cookie': 'saplb_*=(J2EE5011620)5011650'
    //   },
    //   data : data
    // };

    // return axios.get('http://20.73.168.4:50000/RESTAdapter/employees', config)
    //   .then(function (response) {
    //     console.log(JSON.stringify(response.data));
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   });
  }
});


getActiveEmployees = (paygrade, period, businessId, businessUnitConfig) => {
    check(paygrade, Array);
    const year = period.year;
    const month = period.month;
    const firsDayOfPeriod = `${month}-01-${year} GMT`;
    const DateLimit = new Date(firsDayOfPeriod);

    if(businessUnitConfig) {
        let checkEmployeeResumptionForPayroll = businessUnitConfig.checkEmployeeResumptionForPayroll

        if(checkEmployeeResumptionForPayroll) {
            return Meteor.users.find({'employeeProfile.employment.status': 'Active',
                $and: [
                    {'employeeProfile.employment.hireDate': {$lt: DateLimit}},
                    {$or: [
                        {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
                        {'employeeProfile.employment.terminationDate': null},
                        {'employeeProfile.employment.terminationDate' : { $exists : false } }
                    ]}
                ],
                'employeeProfile.employment.paygrade': {$in: paygrade},
                'businessIds': businessId,
                'employee': true
            }).fetch();
        } else {
            return Meteor.users.find({'employeeProfile.employment.status': 'Active',
                $or: [
                    {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
                    {'employeeProfile.employment.terminationDate': null},
                    {'employeeProfile.employment.terminationDate' : { $exists : false } }
                ],
                'employeeProfile.employment.paygrade': {$in: paygrade},
                'businessIds': businessId,
                'employee': true
            }).fetch();
        }
    } else {
        return []
    }
};

