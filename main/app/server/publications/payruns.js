/**
 * Payruns publications
 */

Core.publish("Payruns", function (period) {
    return Payruns.find({period: period});
});

Core.publish("SelfPayruns", function (employeeId) {
    return Payruns.find({employeeId: employeeId});
});

Core.publish("Payrun/SelfPayrunForPeriod", function (employeeId, period) {
    return Payruns.find({employeeId: employeeId, period: period});
});
