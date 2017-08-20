/*****************************************************************************/
/* PayrunApprovalEmployees: Event Handlers */
/*****************************************************************************/
Template.PayrunApprovalEmployees.events({
});

/*****************************************************************************/
/* PayrunApprovalEmployees: Helpers */
/*****************************************************************************/
Template.PayrunApprovalEmployees.helpers({
    
});

/*****************************************************************************/
/* PayrunApprovalEmployees: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrunApprovalEmployees.onCreated(function () {
    let self = this;

    let modalData = self.data
    // console.log(`modalData: `, modalData)
});

Template.PayrunApprovalEmployees.onRendered(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.PayrunApprovalEmployees.onDestroyed(function () {

});
