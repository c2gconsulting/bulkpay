/**
 * ApprovalsConfigs publications
 */

Meteor.publish("approvalsconfigs", function (businessId) {
    check(businessId, String);
    return ApprovalsConfigs.find({businessId: businessId});
    //enhnace this method..
});

/**
 * ApprovalConfig
 */

Core.publish("approvalconfig", function (id) {
    return ApprovalsConfigs.find({_id: id})
});
