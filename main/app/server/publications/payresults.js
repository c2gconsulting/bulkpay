/**
 * PayResults publications
 */

Core.publish("Payresults", function (period) {
    return PayResults.find({period: period});
});

Core.publish("SelfPayresults", function (employeeId) {
    return PayResults.find({employeeId: employeeId});
});

Core.publish("EmployeePayresultsForPeriod", function (employeeIds, periodFormat) {
    return PayResults.find({employeeId: {$in: employeeIds}, period: periodFormat});
});

