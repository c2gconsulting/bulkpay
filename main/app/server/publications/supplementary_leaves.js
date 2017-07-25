
Core.publish("supplementaryLeaves", function (businessId) {
    check(businessId, String);
    return SupplementaryLeaves.find({businessId: businessId});
});

Core.publish("supplementaryLeave", function (id) {
    return SupplementaryLeaves.find({_id: id})
});