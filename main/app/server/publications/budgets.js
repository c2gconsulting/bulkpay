/**
 * Paytypes publications
 */

Meteor.publish("budgets", function (businessId) {
    if(businessId) {
        check(businessId, String);
        return Budgets.find({businessId: businessId});
    }
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("budget", function (id) {
    return Budgets.find({_id: id})
});
