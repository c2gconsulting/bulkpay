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
    },
    "additionalPay/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        AdditionalPayments.remove({_id: id});
        return true;
    },
    "additionalPay/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(id, String);
        
        const selector = {
            _id: id
        };
        const result = AdditionalPayments.update(selector, {$set: details} );
        return result;
    }
})