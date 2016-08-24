/**
 * Divisions publications
 */

Core.publish("Divisions", function (businessId) {
    check(businessId, String);
    return Divisions.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Divisions
 */

Core.publish("Division", function (id) {
    return Divisions.find({_id: id})
});