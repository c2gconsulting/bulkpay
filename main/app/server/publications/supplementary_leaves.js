
Core.publish("supplementaryLeaves", function (businessId) {
    check(businessId, String);
    return SupplementaryLeaves.find({businessId: businessId});
});

Core.publish("supplementaryLeaveForUser", function (businessId, userId) {
    check(businessId, String);
    return SupplementaryLeaves.find({businessId: businessId, employees: {$in: [userId]}});
});

Core.publish("supplementaryLeave", function (id) {
    return SupplementaryLeaves.find({_id: id})
});