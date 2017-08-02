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
    return name ? {exist: true} : {exist: false};
  },
    /**
     * Get employee
     * Params Object
     * props PayGrade, Employee
     */
});


getActiveEmployees = (paygrade, period, businessId, businessUnitConfig) => {
    check(paygrade, Array);
    const year = period.year;
    const month = period.month;
    const firsDayOfPeriod = `${month}-01-${year} GMT`;
    const DateLimit = new Date(firsDayOfPeriod);

    if(businessUnitConfig) {
        let checkEmployeeResumptionForPayroll = businessUnitConfig.checkEmployeeResumptionForPayroll
        console.log(`checkEmployeeResumptionForPayroll: `, checkEmployeeResumptionForPayroll)

        if(checkEmployeeResumptionForPayroll) {
            return Meteor.users.find({'employeeProfile.employment.status': 'Active',
                $and: [
                    {'employeeProfile.employment.hireDate': {$lt: DateLimit}},
                    {$or: [
                        {'employeeProfile.employment.terminationDate': {$gt: DateLimit}},
                        {'employeeProfile.employment.terminationDate': null},
                        {'employeeProfile.employment.terminationDate' : { $exists : false } }
                    ]}
                ],
                'employeeProfile.employment.paygrade': {$in: paygrade},
                'businessIds': businessId,
                'employee': true
            }).fetch();
        } else {
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
        }
    } else {
        return []
    }
};
