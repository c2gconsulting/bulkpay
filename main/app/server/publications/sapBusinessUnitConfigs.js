/**
 * SapBusinessUnitConfigs publications
 */

Core.publish("SapBusinessUnitConfigs", function (businessUnitId) {
    let user = this.userId;
    if (Core.hasPayrollAccess(user)) {
        return SapBusinessUnitConfigs.find({businessId: businessUnitId});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }
});
