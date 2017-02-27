/*****************************************************************************/
/* selectedEvent: Event Handlers */
/*****************************************************************************/
//import _ from 'underscore';
Template.selectedEvent.events({
    'click #approve': (e, tmpl) => {
        let selected = tmpl.data;
        if(selected && selected.hasOwnProperty('type')){
            Meteor.call('approveTimeData', selected, function(err, res){
                if(res){
                    console.log(res);
                    swal('notify', 'are you sure ', 'success');
                } else {
                    console.log(err);
                    swal('Approval Error', `error when approving time data: ${err.message}`, 'error');
                }
            })
        }
    },
    'click #reject': (e, tmpl) => {
        swal('notify', 'are you sure ', 'success');
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
        return Template.instance().data.type === 'Times';
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
    'statusStyle': (status) => {
            if (status === 'Open') return 'btn-warning';
            if (status === 'Approved') return 'btn-success';
            if (status === 'Rejected') return 'btn-danger';
    }
});

/*****************************************************************************/
/* selectedEvent: Lifecycle Hooks */
/*****************************************************************************/
Template.selectedEvent.onCreated(function () {
    let self = this;
});

Template.selectedEvent.onRendered(function () {
    let self = this;
});


Template.selectedEvent.onDestroyed(function () {
});
