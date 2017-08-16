/*****************************************************************************/
/* HmoPlanChangeRequestEntry: Event Handlers */
/*****************************************************************************/
Template.HmoPlanChangeRequestEntry.events({
    'click #edit': (e,tmpl) => {
        Modal.show('HmoPlanChangeRequestCreate', tmpl.data);
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure you want to delete it?",
                text: "You will not be able to recover it!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                Meteor.call("hmoPlanChangeRequests/delete", docId, function(err,res){
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
/* HmoPlanChangeRequestEntry: Helpers */
/*****************************************************************************/
Template.HmoPlanChangeRequestEntry.helpers({
    'active': (status) => {
        if(status === "Open")
            return "warning";
        if(status === "Approved")
            return "success";
        if(status === "Rejected")
            return "danger";
    },
    'name': (id) => {
        let leave = HmoPlans.findOne({_id: id});
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
    }
});

/*****************************************************************************/
/* HmoPlanChangeRequestEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanChangeRequestEntry.onCreated(function () {
});

Template.HmoPlanChangeRequestEntry.onRendered(function () {
});

Template.HmoPlanChangeRequestEntry.onDestroyed(function () {
});
