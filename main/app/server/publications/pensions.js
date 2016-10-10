/**
 * Pensions publications
 */

Core.publish("pensions", function (businessId) {
    check(businessId, String);
    return Pensions.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Pensions
 */

Core.publish("pension", function (id) {
    return Pensions.find({_id: id})
});