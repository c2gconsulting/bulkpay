/*****************************************************************************/
/* ApproveEmployeeTimeOverview: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.ApproveEmployeeTimeOverview.events({
  'click #Approve': function(e, tmpl) {
    e.preventDefault()
    // Modal.show('TaxCreate')
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = tmpl.employeeId

    // Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         Modal.hide('ApproveTimeOverview')
    //         swal('Success', 'Approvals were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
    //     }
    // })
  },
  'click #Reject': function(e, tmpl) {
    e.preventDefault()
    // Modal.show('TaxCreate')
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = tmpl.employeeSuperviseeIds

    // Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         Modal.hide('ApproveTimeOverview')
    //         swal('Success', 'Rejections were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
    //     }
    // })
  },
  'click .approveEmployeeTimeRecords': (e, tmpl) => {
    const rowElement = e.currentTarget.closest('tr');
    let jqueryRowElement = $(rowElement);
    let employeeId = jqueryRowElement.attr('id')

    e.stopPropagation();
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = [employeeId]

    // Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         swal('Success', 'Approvals were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
    //     }
    // })
  },
  'click .rejectEmployeeTimeRecords': (e, tmpl) => {
    const rowElement = e.currentTarget.closest('tr');
    let jqueryRowElement = $(rowElement);
    let employeeId = jqueryRowElement.attr('id')

    e.stopPropagation();
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = [employeeId]

    // Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         swal('Success', 'Rejections were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
    //     }
    // })
  }
});

/*****************************************************************************/
/* ApproveEmployeeTimeOverview: Helpers */
/*****************************************************************************/
Template.registerHelper('equals',(a,b)=>{
  return a == b;
});

Template.ApproveEmployeeTimeOverview.helpers({
    'modalHeaderTitle': function() {
      let startDay = Template.instance().startDay
      let endDay = Template.instance().endDay
      return `Approve time overview (${startDay} - ${endDay})`;
    },
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    'timeRecords': function() {
        return Template.instance().timeRecords.get()
    }
});

/*****************************************************************************/
/* ApproveEmployeeTimeOverview: Lifecycle Hooks */
/*****************************************************************************/
Template.ApproveEmployeeTimeOverview.onCreated(function () {
    let self = this
    let businessUnitId = Session.get('context');

    self.subscribe("allEmployees", businessUnitId);

    self.dataContext = self.data

    self.startDate = self.data.startDate
    self.endDate = self.data.endDate

    self.employeeId = self.data.employeeId

    self.startDay = moment(self.startDate).format('DD/MM/YYYY');
    self.endDay = moment(self.endDate).format('DD/MM/YYYY');

    self.timeRecords = new ReactiveVar()

    //--
    self.autorun(function() {
        self.subscribe("timewritings", businessUnitId, [self.employeeId])

        if (Template.instance().subscriptionsReady()) {
            let queryToFindTimeRecords = {
                day: {$gte: self.startDate, $lte: self.endDate}, 
                // businessId: businessId, employeeId: {$in: supervisorIds}
                employeeId: {$in: [self.employeeId]}
            }
            let timeRecordsToApprove = TimeWritings.find(queryToFindTimeRecords).fetch()
            self.timeRecords.set(timeRecordsToApprove)
        }
    })
});

Template.ApproveEmployeeTimeOverview.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
});

Template.ApproveEmployeeTimeOverview.onDestroyed(function () {
});
