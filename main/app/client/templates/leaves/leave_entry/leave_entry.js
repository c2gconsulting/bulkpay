/*****************************************************************************/
/* LeaveEntry: Event Handlers */
/*****************************************************************************/
Template.LeaveEntry.events({
    'click #edit': (e,tmpl) => {
        Modal.show('LeaveCreate', tmpl.data);
        //swal("you clicked pointer", this, "success");
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Leave Request!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                Meteor.call("leave/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Request Deleted`, "success");
                    } else {
                        swal("Error!", err.reason, "error");
                    }
                });

            });
    }
});

/*****************************************************************************/
/* LeaveEntry: Helpers */
/*****************************************************************************/
Template.LeaveEntry.helpers({
    'active': (status) => {
        if(status === "Open")
            return "warning";
        if(status === "Approved")
            return "success";
        if(status === "Rejected")
            return "danger";
    },
    'name': (id) => {
        let leave = LeaveTypes.findOne({_id: id});
        if(leave)
            return leave.name;
    },
    'canEdit': ()=> {
        let status = Template.instance().data.approvalStatus;
        if(status){
            return status !== "Approved";
        }
    },
    'click view': () => {

    },
    'toTwoDecimalPlaces': function(theNumber) {
        return theNumber ? theNumber.toFixed(2) : ''
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
/* LeaveEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntry.onCreated(function () {
    let self = this;

    let businessId = Session.get('context')

    self.subscribe("activeEmployees", businessId);

    self.businessUnitCustomConfig = new ReactiveVar()

    self.autorun(function() {
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessId, function(err, businessUnitCustomConfig) {
            self.businessUnitCustomConfig.set(businessUnitCustomConfig)            
        })
    })
});

Template.LeaveEntry.onRendered(function () {
});

Template.LeaveEntry.onDestroyed(function () {
});
