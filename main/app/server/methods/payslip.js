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

        let selfPayResults = PayResults.findOne({
            employeeId: Meteor.userId(), 
            period: period
        });

        if(selfPayrun && selfPayResults) {
            return {selfPayrun, selfPayResults}
        } else {
            throw new Meteor.Error(404, 'You do not have a payslip for that period');
        }
    }
})
