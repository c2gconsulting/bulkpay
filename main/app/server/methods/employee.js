// const { default: axios } = require("axios");
import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http'
// import HTTP from 'meteor';

// HTTP.ge


var apiCall = function(apiUrl, callback) {
  // try…catch allows you to handle errors 

  try {
    let jobObject = {
      url: 'http://20.73.168.4:50000/RESTAdapter/employees',
      header: {
        Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
        // username: 'BULKPAY_DEV',
        // password: 'Passw0rd%%'
      },
      body: JSON.stringify({
        "employee_number": "00000002",
      })
    };
     var response = HTTP.call('GET', apiUrl, {
      data: jobObject.body,
      // headers: jobObject.header,
      headers: {
        Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      npmRequestOptions: {"rejectUnauthorized": false}
    }).data;
     // A successful API call returns no error 
     // but the contents from the JSON response
     callback(null, response);
  } catch (error) {
     // If the API responded with an error message and a payload 
     if (error.response) {
        var errorCode = error.response.data.code;
        var errorMessage = error.response.data.message;
        // Otherwise use a generic error message
     } else {
        var errorCode = 500;
        var errorMessage = 'Cannot access the API';
     }
     // Create an Error object and return it via callback
     var myError = new Meteor.Error(errorCode, errorMessage);
     callback(myError, null);
  }
}

/**
 * Tenant Methods
 */
Meteor.methods({
  getEmployees: function () {
    let jobObject = {
      url: 'https://swapi.dev/api/films',
      header: {
        Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
        // username: 'BULKPAY_DEV',
        // password: 'Passw0rd%%'
      },
      body: JSON.stringify({
        "employee_number": "00000002",
      })
    };

    console.log('jobObject', jobObject)
    if (Meteor.isServer) {
      this.unblock()
      
        const resp = HTTP.call('GET', jobObject.url,
        {
          data: jobObject.body,
          // headers: jobObject.header,
          headers: {
            Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
            'Content-Type': 'application/json'
          },
        })

        console.log('resp', resp)
    }
  },
    'getOilservData': function(type = 'employees') {
      // avoid blocking other method calls from the same client
      this.unblock();
      var apiUrl = 'http://jsonplaceholder.typicode.com/posts/1'// + type;
      // asynchronous call to the dedicated API calling function
      var response = Meteor.wrapAsync(apiCall)(apiUrl);
      return response;
   }
});



// if (Meteor.isServer) {
//   console.log('runing get employees ----')
//   const data = {
//     url: 'http://20.73.168.4:50000/RESTAdapter/employees',
//     header: {
//       Authorization: `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`,
//       // username: 'BULKPAY_DEV',
//       // password: 'Passw0rd%%'
//     },
//     body: JSON.stringify({
//       "employee_number": "",
//     })
//   }

//   Meteor.call('getEmployees', { data }, function (err, res) {
//     console.log('err, res', err, res)
//   })
// }
