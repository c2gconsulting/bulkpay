import _ from 'underscore';

Meteor.methods({
    'Payslip/getSelfPayslipForPeriod': function (businessId, period) {
        check(period, String);
        check(businessId, String);
        this.unblock();

        let selfPayrun = Payruns.findOne({
            employeeId: Meteor.userId(),
            businessId: businessId,
            period: period
        })

        if(selfPayrun) {
            return selfPayrun
        } else {
            throw new Meteor.Error(404, 'You do not have a payslip for that period');
        }
    }
})
