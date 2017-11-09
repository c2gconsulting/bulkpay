/**
 * Payruns publications
 */

Core.publish("Payruns", function (period, businessId) {
    return Payruns.find({period: period, businessId});
});

Core.publish("SelfPayruns", function (employeeId) {
    return Payruns.find({employeeId: employeeId});
});

Core.publish("EmployeePayrunsForPeriod", function (employeeIds, periodFormat) {
    return Payruns.find({employeeId: {$in: employeeIds}, period: periodFormat});
});

Core.publish("Payrun/SelfPayrunForPeriod", function (employeeId, period) {
    return Payruns.find({employeeId: employeeId, period: period});
});
