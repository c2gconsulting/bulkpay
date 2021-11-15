/**
 * Paytypes publications
 */

Core.publish("employeedelegates", function (businessId) {
    check(businessId, String);
    return EmployeeDelegates.find({ businessId: businessId, createdBy: Meteor.user()._id });
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("employeedelegate", function (id) {
    return EmployeeDelegates.find({_id: id})
});
