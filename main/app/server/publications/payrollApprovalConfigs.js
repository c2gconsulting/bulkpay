/**
 * PayrollApprovalConfigs publications
 */

Core.publish("PayrollApprovalConfigs", function (businessUnitId) {
    let user = this.userId;
    if (Core.hasPayrollAccess(user)) {
        return PayrollApprovalConfigs.find({businessId: businessUnitId});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }
});
