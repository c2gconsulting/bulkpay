/**
 * Paytypes publications
 */

Meteor.publish("travelcities", function (businessId) {
    check(businessId, String);
    return Travelcities.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("travelcity", function (id) {
    return Travelcities.find({_id: id})
});
