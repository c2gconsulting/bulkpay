/**
 * EmployeesLevels publications
 */

Meteor.publish("employeeslevels", function (businessId) {
    check(businessId, String);
    return EmployeesLevels.find({businessId: businessId});
    //enhnace this method..
});

/**
 * ApprovalConfig
 */

Core.publish("employeelevels", function (id) {
    return EmployeesLevels.find({_id: id})
});
