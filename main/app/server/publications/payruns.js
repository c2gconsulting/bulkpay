/**
 * Payruns publications
 */

Core.publish("Payruns", function (employeeIds, period) {
    return Payruns.find({employeeId: {$in: employeeIds}, period: period});
});

Core.publish("SelfPayruns", function (employeeIds) {
    return Payruns.find({employeeId: {$in: employeeIds}});
});
