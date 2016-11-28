/**
 * Paygrades publications
 */

Core.publish("paygrades", function (businessId) {
    check(businessId, String);
    return PayGrades.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("paygrade", function (id) {
    return PayGrades.find({_id: id});
});