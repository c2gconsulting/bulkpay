/*****************************************************************************/
/* ApproveTimeOverview: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.ApproveTimeOverview.events({

});

/*****************************************************************************/
/* ApproveTimeOverview: Helpers */
/*****************************************************************************/
Template.registerHelper('equals',(a,b)=>{
  return a == b;
});

Template.ApproveTimeOverview.helpers({
    'modalHeaderTitle': function() {
      let startDay = Template.instance().startDay
      let endDay = Template.instance().endDay
      return `Approve time overview (${startDay} - ${endDay})`;
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    }
});

/*****************************************************************************/
/* ApproveTimeOverview: Lifecycle Hooks */
/*****************************************************************************/
Template.ApproveTimeOverview.onCreated(function () {
    let self = this
    let businessUnitId = Session.get('context');

    self.subscribe("allEmployees", businessUnitId);

    self.dataContext = self.data
    console.log(`Modal data context:`, self.data)

    let startDate = self.data.startDate
    let endDate = self.data.endDate

    self.startDay = moment(startDate).format('DD/MM/YYYY');
    self.endDay = moment(endDate).format('DD/MM/YYYY');
    //--
    self.autorun(function() {
        if (Template.instance().subscriptionsReady()) {

            // let queryToFindTimeRecords = {
            //     day: {$gte: startDay, $lte: endDay}, 
            //     // businessId: businessId, employeeId: {$in: supervisorIds}
            //     employeeId: {$in: supervisorIds}
            // }
            // let timeRecordsToApprove = TimeWritings.find(queryToFindTimeRecords).fetch()

        }
    })
});

Template.ApproveTimeOverview.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
});

Template.ApproveTimeOverview.onDestroyed(function () {
});
