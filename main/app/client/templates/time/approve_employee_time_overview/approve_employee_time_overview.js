/*****************************************************************************/
/* ApproveEmployeeTimeOverview: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
import _ from 'underscore';

Template.ApproveEmployeeTimeOverview.events({
  'click .approveEmployeeTimeRecord': function(e, tmpl) {
    e.preventDefault()
    const rowElement = e.currentTarget.closest('tr');
    let jqueryRowElement = $(rowElement);
    let timeRecordId = jqueryRowElement.attr('id')
    // console.log(`timeRecordId: `, timeRecordId)
    
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeId = tmpl.employeeId

    // Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         Modal.hide('ApproveTimeOverview')
    //         swal('Success', 'Approvals were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
    //     }
    // })
  },
  'click .rejectEmployeeTimeRecord': function(e, tmpl) {
    e.preventDefault()
    const rowElement = e.currentTarget.closest('tr');
    let jqueryRowElement = $(rowElement);
    let timeRecordId = jqueryRowElement.attr('id')
    // console.log(`timeRecordId: `, timeRecordId)

    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeId = tmpl.employeeId

    // Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
    //     if(res){
    //         Modal.hide('ApproveTimeOverview')
    //         swal('Success', 'Rejections were successful', 'success');
    //     } else {
    //         swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
    //     }
    // })
  },
  'click #ApproveAll': (e, tmpl) => {ApproveAll
    e.stopPropagation();
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = [tmpl.employeeId]

    Meteor.call('approveTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            Modal.hide('ApproveEmployeeTimeOverview')
            swal('Success', 'Approvals were successful', 'success');
        } else {
            swal('Approval Error', `error when approving time-records: ${err.message}`, 'error');
        }
    })
  },
  'click #RejectAll': (e, tmpl) => {
    e.stopPropagation();
    //--
    let businessId = Session.get('context');

    let startDate = tmpl.startDate
    let endDate = tmpl.endDate
    let employeeSuperviseeIds = [tmpl.employeeId]

    Meteor.call('rejectTimeDataInPeriod', startDate, endDate, businessId, employeeSuperviseeIds, function(err, res){
        if(res){
            Modal.hide('ApproveEmployeeTimeOverview')
            swal('Success', 'Rejections were successful', 'success');
        } else {
            swal('Approval Error', `error when rejecting time-records: ${err.message}`, 'error');
        }
    })
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
    },
    'getProjectName': function(projectId) {
        if(projectId) {
            const project = Projects.find({_id: projectId}).fetch()
            return project ? project.name : '---'
        } else {
            return '---'
        }
    },
    'getCostCenterName': function(costCenterId) {
        if(costCenterId) {
            const center = EntityObjects.find({_id: costCenterId}).fetch()
            return center ? center.name : '---'
        } else {
            return '---'
        }
    },
    'getActivityName': function(activityId) {
        if(activityId) {
            let activity = Activities.find({_id: activityId}).fetch();
            return activity ? activity.description : '---'
        } else {
            return '---'
        }
    },
    'getDayText': function(date) {
        let dateMoment = moment(date).format('DD/MM/YYYY')

        return dateMoment
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

        self.subscribe('employeeprojects', businessUnitId);
        self.subscribe('getCostElement', businessUnitId);
        self.subscribe('AllActivities', businessUnitId);

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
