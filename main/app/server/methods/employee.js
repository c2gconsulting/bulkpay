/**
 * Tenant Methods
 */
Meteor.methods({
  'checkEmployeeExistence': (employeeId, businessId) => {
    // check(employeeId, String);
    // check(businessId, String);
    // if(!Core.hasPayrollAccess(this.userId)){
    //     throw new Meteor.Error(403, "Access Denied");
    // }
    let name = Meteor.users.findOne({'employeeProfile.employeeId': employeeId, 'businessIds': businessId});
    console.log(name);
    return name ? {exist: true} : {exist: false};
  },
    /**
     * Get employee
     * Params Object
     * props PayGrade, Employee
     */
});


getActiveEmployees = (paygrade, period, businessId) => {
    check(paygrade, Array);
    const year = period.year;
    const month = period.month;
    const firsDayOfPeriod = `01-${month}-${year} GMT`;
    const DateLimit = new Date(firsDayOfPeriod);
    return Meteor.users.find({'employeeProfile.employment.status': 'Active',
        $or: [
            {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
            {'employeeProfile.employment.terminationDate': null},
            {'employeeProfile.employment.terminationDate' : { $exists : false } }
        ],
        'employeeProfile.employment.paygrade': {$in: paygrade},
        'businessIds': businessId,
        'employee': true
    }).fetch();
};
