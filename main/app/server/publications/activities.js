/**
 * Paytypes activities
 */

Core.publish("activities", function (type, departmentOrProjectId) {
    check(type, String);
    check(departmentOrProjectId, String);

    return Activities.find({type: type, departmentOrProjectId: departmentOrProjectId});
});
