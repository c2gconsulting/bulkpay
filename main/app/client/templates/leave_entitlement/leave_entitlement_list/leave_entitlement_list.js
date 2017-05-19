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

});


/*****************************************************************************/
/* LeaveEntitlementsIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntitlementsIndex.onCreated(function () {
    let self = this;

    self.autorun(function(){

    });
});

Template.LeaveEntitlementsIndex.onRendered(function () {
    let self = this;
});

Template.LeaveEntitlementsIndex.onDestroyed(function () {
});
