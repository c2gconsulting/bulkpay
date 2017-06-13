/*****************************************************************************/
/* ApproveTimeOverview: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.ApproveTimeOverview.events({
//   'click .employeeTimeRow': function(e, tmpl) {
//     const rowElement = e.currentTarget
//     let jqueryRowElement = $(rowElement);
//     let employeeId = jqueryRowElement.attr('id')

//     e.stopPropagation();

//     let startDate = tmpl.startDate
//     let endDate = tmpl.endDate

//     Modal.hide('ApproveTimeOverview')

//     setTimeout(function() {
//       Modal.show('ApproveEmployeeTimeOverview', {startDate, endDate, employeeId})
//     }, 1000)
//   },
  'click #Approve': function(e, tmpl) {
    e.preventDefault()
    // Modal.show('TaxCreate')
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = tmpl.employeeSuperviseeIds

    Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            Modal.hide('ApproveTimeOverview')
            swal('Success', 'Approvals were successful', 'success');
        } else {
            swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
        }
    })
  },
  'click #Reject': function(e, tmpl) {
    e.preventDefault()
    // Modal.show('TaxCreate')
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = tmpl.employeeSuperviseeIds

    Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            Modal.hide('ApproveTimeOverview')
            swal('Success', 'Rejections were successful', 'success');
        } else {
            swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
        }
    })
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

    Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            swal('Success', 'Approvals were successful', 'success');
        } else {
            swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
        }
    })
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

    Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            swal('Success', 'Rejections were successful', 'success');
        } else {
            swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
        }
    })
  }
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
    },
    'timeRecords': function() {
        return Template.instance().timeRecords.get()
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

    self.startDate = self.data.startDate
    self.endDate = self.data.endDate

    self.employeeSuperviseeIds = self.data.employeeSuperviseeIds

    self.startDay = moment(self.startDate).format('DD/MM/YYYY');
    self.endDay = moment(self.endDate).format('DD/MM/YYYY');

    self.timeRecords = new ReactiveVar()

    //--
    self.autorun(function() {
        self.subscribe("timewritings", businessUnitId, self.employeeSuperviseeIds)

        if (Template.instance().subscriptionsReady()) {
            let queryToFindTimeRecords = {
                day: {$gte: self.startDate, $lte: self.endDate}, 
                // businessId: businessId, employeeId: {$in: supervisorIds}
                employeeId: {$in: self.employeeSuperviseeIds}
            }
            let timeRecordsToApprove = TimeWritings.find(queryToFindTimeRecords).fetch()

            if(timeRecordsToApprove && timeRecordsToApprove.length > 0) {
                let timeRecords = []
                _.each(timeRecordsToApprove, aTime => {
                    let employeeFound = _.find(timeRecords, anEmployeeTime => {
                        return anEmployeeTime.employeeId === aTime.employeeId
                    })
                    if(employeeFound) {
                        employeeFound.totalHours += aTime.duration
                    } else {
                        let employee = Meteor.users.findOne(aTime.employeeId)
                        let empId = ''
                        let employeeFullName = ''
                        if(employee) {
                            empId = employee.employeeProfile.employeeId
                            employeeFullName = employee.profile.fullName
                        }
                        timeRecords.push({
                            empId: empId,
                            employeeId: aTime.employeeId,
                            employeeFullName: employeeFullName,
                            totalHours: aTime.duration
                        })
                    }
                })
                self.timeRecords.set(timeRecords)
            }
        }
    })
});

Template.ApproveTimeOverview.onRendered(function () {
    let self = this;
    self.$('select.dropdown').dropdown();
});

Template.ApproveTimeOverview.onDestroyed(function () {
});
