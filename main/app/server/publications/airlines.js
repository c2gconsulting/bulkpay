/**
 * Paytypes publications
 */

Meteor.publish("airlines", function (businessId) {
    check(businessId, String);
    return Airlines.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("airline", function (id) {
    return Airlines.find({_id: id})
});
