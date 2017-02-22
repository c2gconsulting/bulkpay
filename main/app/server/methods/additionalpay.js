Meteor.methods({
    'additionalPay/create': (params, businessId) => {
        check(businessId, String);
        console.log('loggin user id',this.userId);
        //if (Core.hasPayrollAccess(this.userId))
          //  throw new Meteor.Error(401, "Unauthorized");
        //check if payment exists for employee in specified period
        //check if overwrite flag
        console.log(params);
        let existingPayment = AdditionalPayments.findOne({employee: params.employee, paytype: params.paytype, period: params.period});
        if (existingPayment)
            throw new Meteor.Error(302, "Payment exists for employee in period");
        //create payment
        let paymentId = AdditionalPayments.insert(params)
        return {_id: paymentId};
    }
})