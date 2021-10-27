// const { default: axios } = require("axios");
import axios from 'axios'
// import { Meteor } from 'meteor/meteor';

var MyLogger = function (opts) {
  console.log('Level', opts.level)
  console.log('Message', opts.message)
  console.log('Tag', opts.tag)
}

SyncedCron.config({
  logger: MyLogger
})

/*
 * instantiate loader
 */
this.Loader = new DataLoader();


SyncedCron.add({
  name: 'WEEKEND\'S CRON JOB SCHEDULE FOR COST CENTERS',
  schedule: function (parser) {
    // parser is a later.parse object

    console.log('every 5 mins every weekend')
    // fires on the 5th minute of every hour during Sat and Sun
    return parser.recur().on(0).hour().onWeekend();
    // return parser.recur().on(0).mins().onWeekday();
    // return parser.text('every 1 mins')
    // return parser.text('every 5 mins every weekend')
  },
  job: async function () {
    if (Meteor.isServer) {
      const user = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
      console.log('user ---- user', user);
      /** BEGIN::: EMPLOYEES IMPORT */
      Core.Log.info('Startup ::: EMPLOYEES CRON JOB IN ACTION')
      axios
      .post(
        'http://20.73.168.4:50000/RESTAdapter/employees',
        {
          employee_number: ''
        },
        {
          headers: {
            Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
            'Content-Type': 'application/json',
            Cookie:
              'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
          },
          proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
        }
      )
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data))
        const { data } =  response;
        Loader.loadEmployeeData(data)
        // const { Employees: { line } }
      })
      .catch(function (error) {
        // handle error
        console.log(error)
      })
      .then(function () {
        console.log('err')
        // always executed
      })
      /** END::: EMPLOYEES IMPORT */



      // /** BEGIN::: COST CENTERS IMPORT */
      // Core.Log.info('STARTUP:: COST CENTERS CRON JOB IN ACTION')
      // axios
      // .post(
      //   'http://20.73.168.4:50000/RESTAdapter/costcenters',
      //   {
      //     employee_number: ''
      //   },
      //   {
      //     headers: {
      //       Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
      //       'Content-Type': 'application/json',
      //       Cookie:
      //         'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
      //     },
      //     proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
      //   }
      // )
      // .then(function (response) {
      //   // handle success
      //   console.log(JSON.stringify(response.data))
      //   const { data } =  response;
      //   Loader.loadCostCenterData(data)
      // })
      // .catch(function (error) {
      //   // handle error
      //   console.log(error)
      // })
      // .then(function () {
      //   console.log('err')
      //   // always executed
      // })
      // /** END::: COST CENTERS IMPORT */



      /** BEGIN::: PROJECTS IMPORT */
      Core.Log.info('STARTUP:: PROJECT CRON JOB IN ACTION')
      axios
      .post(
        'http://20.73.168.4:50000/RESTAdapter/projects',
        {
          employee_number: ''
        },
        {
          headers: {
            Authorization: 'Basic QlVMS1BBWV9ERVY6UGFzc3cwcmQlJQ==',
            'Content-Type': 'application/json',
            Cookie:
              'JSESSIONID=5kfVra385oH81KSzlcgDQcm930NrfAHCeEwA_SAP8i4nHR_PRsyEcufSUvz4_frw; saplb_*=(J2EE5011620)5011650'
          },
          proxy: { protocol: 'http',host: '20.73.168.4',port: 50000 }
        }
      )
      .then(function (response) {
        // handle success
        console.log(JSON.stringify(response.data))
        const { data } =  response;
        Loader.loadProjectData(data)
        // const { Employees: { line } }
      })
      .catch(function (error) {
        // handle error
        console.log(error)
      })
      .then(function () {
        console.log('err')
        // always executed

        // SyncedCron.remove('WEEKEND\'S CRON JOB SCHEDULE FOR COST CENTERS');
      })
      /** END::: PROJECTS IMPORT */
      SyncedCron.remove('WEEKEND\'S CRON JOB SCHEDULE FOR COST CENTERS');
    }
  }
})



SyncedCron.add({
  name: 'TRAVEL RETIREMENT REMINDER CRON JOB SCHEDULE',
  schedule: function (parser) {
    // parser is a later.parse object

    console.log('every 5 mins every weekend')
    // const now = new Date();
    // return parser.recur().on(new Date()).fullDate();
    // return parser.recur().on(12).hour().onWeekday();
    // return parser.cron(`${ now.getMinutes() } ${ now.getHours() } * * *`);
    // return parser.recur().on(0, 8, 20).hour().onWeekend();
    return parser.text('every 1 mins')
    // return parser.text('every 5 mins every weekend')
  },
  job: function () {
    Core.Log.info('TRAVEL RETIREMENT REMINDER CRON JOB IN ACTION')


    Partitioner.directOperation(function() {
      const user = Meteor.users.findOne({ 'emails.address': 'adesanmiakoladedotun@gmail.com' });
      const userGroup = Partitioner.getUserGroup(user._id)
      Partitioner.bindGroup(userGroup, function() {
        try {
          const travelReminder = () => {
            const endedDate = new Date()
            const travelList = TravelRequisition2s.find({
              "trips.returnDate": { $gte: endedDate },
              // $and: [{ retirementStatus: "Not Retired" }, { $or: [{ status: "Processed By Logistics" }, { status: "Processed By BST" }] }]
            }).fetch();

            console.log('travelList', JSON.stringify(travelList))

            travelList.forEach((eachTravel) => {
              console.log(JSON.stringify(eachTravel));
            })
          }

          travelReminder();
        } catch (error) {
          console.log('CostCenters ---error', error)
        }
      })
    });
    SyncedCron.remove('WEEKEND\'S CRON JOB SCHEDULE FOR COST CENTERS');
  }
})
