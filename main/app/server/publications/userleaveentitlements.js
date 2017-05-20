
Core.publish("UserLeaveEntitlement", function (businessUnitId, userId) {
    return UserLeaveEntitlements.find({businessId: businessUnitId, userId: userId});
});
