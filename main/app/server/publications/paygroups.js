/**
 * Paytypes publications
 */

Core.publish("payGroups", function (businessId) {
    check(businessId, String);
    return PayGroups.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("payGroup", function (id) {
    return PayGroups.find({_id: id});
});