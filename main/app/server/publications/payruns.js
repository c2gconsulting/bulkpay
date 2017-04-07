/**
 * Payruns publications
 */

Core.publish("Payruns", function (period) {
    return Payruns.find({period: period});
});

Core.publish("SelfPayruns", function (employeeId) {
    return Payruns.find({employeeId: employeeId});
});
