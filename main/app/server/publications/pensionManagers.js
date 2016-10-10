/**
 * Paytypes publications
 */

Core.publish("pensionManagers", function (businessId) {
    check(businessId, String);
    return PensionManagers.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("pensionManager", function (id) {
    return PensionManagers.find({_id: id})
});