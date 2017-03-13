/**
 * Payruns publications
 */

Core.publish("Payruns", function (employeeId, period) {
    return Payruns.find({employeeId: employeeId, period: period});
});
