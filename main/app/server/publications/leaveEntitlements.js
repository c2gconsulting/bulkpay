
Core.publish("LeaveEntitlements", function (businessUnitId) {
    return LeaveEntitlements.find({businessId: businessUnitId});
});