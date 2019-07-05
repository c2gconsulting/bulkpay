/**
 * Paytypes publications
 */

Meteor.publish("travelcities", function (businessId) {
    check(businessId, String);
    return Travelcities.find({businessId: businessId});
    //enhnace this method..
});

Meteor.publish("alltravelcities", function () {
    return Travelcities.find({});
    // console.log("this is")
    // console.log(this)
    console.log("alltravelcities is")
    console.log(alltravelcities)
});




/**
 * Paytype
 */

Meteor.publish("travelcity", function (id) {
    return Travelcities.find({_id: id})
});
