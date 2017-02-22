/**
 * Additional payment deductions publications
 */

Core.publish("AdditionalPaymentDeduction", function (businessId, limit) {
    check(businessId, String);
    check(limit, Number);
    if(Core.hasPayrollAccess(this.userId)){
        //get all paytypeId of all paygrades
       return AdditionalPayments.find({businessId: businessId}, {limit: limit, sort: {date_created: -1}});
    } else {
        return this.ready();
    }

});