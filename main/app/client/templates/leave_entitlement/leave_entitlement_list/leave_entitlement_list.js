/*****************************************************************************/
/* LeaveEntitlementsIndex: Event Handlers */
/*****************************************************************************/
Template.LeaveEntitlementsIndex.events({
    'click #createLeaveEntitlement': (e, tmpl) => {
        Modal.show('LeaveEntitlementCreate')
    }
});

/*****************************************************************************/
/* LeaveEntitlementsIndex: Helpers */
/*****************************************************************************/
Template.LeaveEntitlementsIndex.helpers({
    leaveEntitlements: function() {
        return LeaveEntitlements.find({})
    }
});


/*****************************************************************************/
/* LeaveEntitlementsIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntitlementsIndex.onCreated(function () {
    let self = this;

    self.autorun(function(){
        self.subscribe('LeaveEntitlements', Session.get('context'));
    });
});

Template.LeaveEntitlementsIndex.onRendered(function () {
    let self = this;
});

Template.LeaveEntitlementsIndex.onDestroyed(function () {
});

//----------

/*****************************************************************************/
/* LeaveEntitlementEntry: Event Handlers */
/*****************************************************************************/
Template.LeaveEntitlementEntry.events({
    'click #edit': (e, tmpl) => {
        Modal.show('LeaveEntitlementCreate', tmpl.data);
    },
    'click #delete': (e,tmpl) => {
        swal({  
                title: "Are you sure?",
                text: "You will not be able to recover this Leave Entitlement!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                Meteor.call("LeaveEntitlement/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Leave entitlement Deleted`, "success");
                    } else {
                        swal("Error!", err.reason, "error");
                    }
                });

            });
    }
});

/*****************************************************************************/
/* LeaveEntitlementEntry: Helpers */
/*****************************************************************************/
Template.LeaveEntitlementEntry.helpers({
    'name': (leaveEntitlementId) => {
        let leaveEntitlement = LeaveEntitlements.findOne({_id: leaveEntitlementId});
        if(leaveEntitlement)
            return leaveEntitlement.name;
    }
});

/*****************************************************************************/
/* LeaveEntitlementEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntitlementEntry.onCreated(function () {
});

Template.LeaveEntitlementEntry.onRendered(function () {
});

Template.LeaveEntitlementEntry.onDestroyed(function () {
});
