/**
 * Paytypes publications
 */

Core.publish("flights", function (businessId) {
    check(businessId, String);
    return Flights.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("flight", function (id) {
    return Flights.find({_id: id})
});
