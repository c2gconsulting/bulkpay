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
    },
    'click #deleteLeaveBySupervisor': (e, tmpl) => {
        let selected = tmpl.data;
        if(selected && selected.hasOwnProperty('type')){
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
                    Meteor.call('leave/delete', selected.id, function(err, res){
                        if(res) {
                            Modal.hide('selectedEvent');
                            swal('Success', 'Successfully deleted leave record', 'success');
                        } else {
                            swal('Delete Error', `${err.message}`, 'error');
                        }
                    })
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
    'timeRecord': () => {
        return Template.instance().data.type === 'TimeRecord';
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
    'canApproveTimeRecord': (employeeId, status) => {
        return Core.hasTimeApprovalAccess(Meteor.userId()) && Meteor.userId() !== employeeId && status === 'Pending' ;
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
    },
    'getMonth': function (index) {
        if (index == 1) {
            return 'January'
        } else if (index == 2) {
            return 'Feburary'
        } else if (index == 2) {
            return 'March'
        } else if (index == 4) {
            return 'April'
        } else if (index == 5) {
            return 'May'
        } else if (index == 6) {
            return 'June'
        } else if (index == 7) {
            return 'July'
        } else if (index == 8) {
            return 'August'
        } else if (index == 9) {
            return 'September'
        } else if (index == 10) {
            return 'October'
        } else if (index == 11) {
            return 'November'
        } else if (index == 12) {
            return 'December'
        }
    },
    isRelieverEnabledForLeaveRequests: function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isRelieverEnabledForLeaveRequests
        }
    },
    getRelieverFullName: function(relieverUserId) {
        const user = Meteor.users.findOne(relieverUserId);
        if(user && user.profile) {
            return user.profile.fullName
        } else {
            return ''
        }
    }
});

/*****************************************************************************/
/* selectedEvent: Lifecycle Hooks */
/*****************************************************************************/
Template.selectedEvent.onCreated(function () {
    let self = this;

    let businessId = Session.get('context');

    self.subscribe("activeEmployees", businessId);
    self.subscribe('AllActivities', businessId);

    self.businessUnitCustomConfig = new ReactiveVar()
    
    self.autorun(function() {
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, businessUnitCustomConfig) {
            self.businessUnitCustomConfig.set(businessUnitCustomConfig)            
        })
    })
});

Template.selectedEvent.onRendered(function () {
    let self = this;
    console.log('this is me: ', self)
});


Template.selectedEvent.onDestroyed(function () {
});
