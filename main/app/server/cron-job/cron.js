// const { default: axios } = require("axios");

var MyLogger = function(opts) {
  console.log('Level', opts.level);
  console.log('Message', opts.message);
  console.log('Tag', opts.tag);
}

SyncedCron.config({
  logger: MyLogger
});

SyncedCron.add({
  name: 'Crunch some important numbers for the marketing department',
  schedule: function(parser) {
    // parser is a later.parse object

    console.log('every 5 mins every weekend');
    return parser.text('every 1 mins');
    // return parser.text('every 5 mins every weekend')
  },
  job: function() {
    // console.log('GETTTTTT --- job', 'job')
    // // getemp("")
    try {
      Meteor.call('getEmployees')
    } catch (error) {
      console.log('getemp --- error', error)
    }
    // try {
    //  Meteor.call('createOrUpdateEmployees')
    // } catch (error) {
    //   console.log('job --- error', error)
    // }
    // var numbersCrunched = CrushSomeNumbers();
    // var data = JSON.stringify({
    //   "employee_number": "00000002",
    //   // auth: {
    //   //   username: 'BULKPAY_DEV',
    //   //   password: 'Passw0rd%%'
    //   // }
    // });

    // const connectionUrl = 'https://swapi.dev/api/films';
    const anoconnectionUrl = 'http://20.73.168.4:50000/RESTAdapter/employees';

    // var config = {
    //   method: 'POST',
    //   url: anoconnectionUrl,
    //   headers: { 
    //     'Authorization': `Basic ${Buffer.from('BULKPAY_DEV:Passw0rd%%').toString("base64")}`, 
    //     'Content-Type': 'application/json',
    //     cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    //     credentials: 'same-origin',
    //     // 'Cookie': 'saplb_*=(J2EE5011620)5011650'
    //   },
    //   // data : data
    // };
  
    // return axios.get(connectionUrl)
    //   .then(function (response) {
    //     console.log('JSON.stringify(response.data)');
    //     console.log(JSON.stringify(response.data));
    //   })
    //   .catch(function (error) {
    //     console.log('error', error);
    //   });
  }
});