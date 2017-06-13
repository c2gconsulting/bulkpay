/*****************************************************************************/
/* selectedEvent: Event Handlers */
/*****************************************************************************/
//import _ from 'underscore';
Template.selectedEvent.events({
    'click #approve': (e, tmpl) => {
        let selected = tmpl.data;
        if(selected && selected.hasOwnProperty('type')){
            swal({
                    title: "Are you sure?",
                    text: "This action cannot be reversed!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, Approve!",
                    cancelButtonText: "No, cancel",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        Meteor.call('approveTimeData', selected, function(err, res) {
                            if(res){
                                swal('Success', 'Successfully approved event', 'success');
                            } else {
                                swal('Approval Error', `error when approving time data: ${err.message}`, 'error');
                            }
                        })
                    } else {
                        swal("Cancelled", "Approval action cancelled :)", "error");
                    }
                });
        }
    },
    'click #reject': (e, tmpl) => {
        let selected = tmpl.data;
        if(selected && selected.hasOwnProperty('type')){
            swal({
                    title: "Are you sure?",
                    text: "This action cannot be reversed!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, Reject!",
                    cancelButtonText: "No, cancel",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm){
                    if (isConfirm) {
                        Meteor.call('rejectTimeData', selected, function(err, res){
                            if(res){
                                swal('Success', 'Successfully Rejected event', 'success');
                            } else {
                                swal('Approval Error', `error when rejecting time data: ${err.message}`, 'error');
                            }
                        })
                    } else {
                        swal("Cancelled", "Approval action cancelled :)", "error");
                    }
                });

        }
    },
    'click #deleteByCreator': (e, tmpl) => {
        let selected = tmpl.data;
        if(selected && selected.hasOwnProperty('type')){
            Modal.hide('selectedEvent')
            swal({
                    title: "Are you sure?",
                    text: "This action cannot be reversed!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No",
                    closeOnConfirm: false,
                    closeOnCancel: false
            },
            function(isConfirm){
                if (isConfirm) {
                    Meteor.call('time/delete', selected.id, function(err, res){
                        if(res){
                            Modal.hide('selectedEvent');
                            swal('Success', 'Successfully deleted time record', 'success');
                        } else {
                            swal('Delete Error', `${err.message}`, 'error');
                        }
                    })
                } else {
                    swal("Cancelled", "Approval action cancelled :)", "error");
                }
            });
        }
    }
});

/*****************************************************************************/
/* selectedEvent: Helpers */
/*****************************************************************************/
Template.selectedEvent.helpers({
    'selected': () => {
        let obj = Template.instance().data;
        return eval(obj.type).findOne({_id: obj.id});
    },
    'leave': () => {
        return Template.instance().data.type === 'Leaves';
    },
    'time': () => {
        return Template.instance().data.type === 'TimeWritings';
    },
    'getActivityDescription': (id) => {
        let activity = Activities.findOne({_id: id});
        return activity ? activity.description : '---';
    },
    'employeeName': (id) => {
        return Meteor.users.findOne({_id: id}).profile.fullName;
    },
    'leaveType': (id) => {
        return LeaveTypes.findOne({_id: id}).name;
    },
    'canApproveLeave': (employeeId, approvalStatus) => {
        return Core.hasLeaveApprovalAccess(Meteor.userId()) && Meteor.userId() !== employeeId && approvalStatus === 'Open';
    },
    'canApproveTime': (employeeId, status) => {
        return Core.hasTimeApprovalAccess(Meteor.userId()) && Meteor.userId() !== employeeId && status === 'Open' ;
    },
    'canDeleteIt': function(employeeId, status) {
        return Meteor.userId() === employeeId && status === 'Open';
    },
    'statusStyle': (status) => {
            if (status === 'Open') return 'btn-warning';
            if (status === 'Approved') return 'btn-success';
            if (status === 'Rejected') return 'btn-danger';
    },
    'toTwoDecimalPlaces': function(theNumber) {
        return theNumber.toFixed(2)
    }
});

/*****************************************************************************/
/* selectedEvent: Lifecycle Hooks */
/*****************************************************************************/
Template.selectedEvent.onCreated(function () {
    let self = this;
    self.subscribe('AllActivities', Session.get('context'));
});

Template.selectedEvent.onRendered(function () {
    let self = this;
});


Template.selectedEvent.onDestroyed(function () {
});
