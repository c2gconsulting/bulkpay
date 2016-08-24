/**
 * Divisions publications
 */

Core.publish("Departments", function (divisonId) {
    check(divisionId, String);
    return Departments.find({divisionId: divisionId});
});

/**
 * Divisions
 */

Core.publish("Department", function (id) {
    return Departments.find({_id: id})
});