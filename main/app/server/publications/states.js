/**
 * Paytypes publications
 */

Core.publish("states", function (businessId) {
    check(businessId, String);
    return States.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("state", function (id) {
    return States.find({_id: id})
});
