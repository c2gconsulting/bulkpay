/**
 * Taxes publications
 */

Core.publish("taxes", function (businessId) {
    check(businessId, String);
    return Tax.find({businessId: businessId});
    //enhnace this method..
});

/**
 * tax
 */

Core.publish("tax", function (id) {
    return Tax.find({_id: id})
});