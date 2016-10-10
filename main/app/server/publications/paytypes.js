/**
 * Paytypes publications
 */

Core.publish("PayTypes", function (businessId) {
    check(businessId, String);
    return PayTypes.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("PayType", function (id) {
    return PayTypes.find({_id: id})
});