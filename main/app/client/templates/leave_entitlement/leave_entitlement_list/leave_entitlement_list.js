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
    'click #delete': (e, tmpl) => {

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
