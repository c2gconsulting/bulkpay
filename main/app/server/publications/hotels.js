/**
 * Paytypes publications
 */

Core.publish("hotels", function (businessId) {
    check(businessId, String);
    return Hotels.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("hotel", function (id) {
    return Hotels.find({_id: id})
});
