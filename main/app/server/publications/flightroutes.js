/**
 * Paytypes publications
 */

Core.publish("flightroutes", function (businessId) {
    check(businessId, String);
    return Flightroutes.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("flightroute", function (id) {
    return Flightroutes.find({_id: id})
});
