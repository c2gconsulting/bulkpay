/**
 * Paytypes publications
 */

Core.publish("PayTypes", function (businessId) {
    check(businessId, String);
    return PayTypes.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("PayType", function (id) {
    return PayTypes.find({_id: id})
});

/**
 * Get paytypes for payroll run
 */


// support for annual payments ... will review this such that validity is added and the payment is automatically picked
Core.publish("AdditionalPayTypes", function (paygrades, businessId) {
    check(businessId, String);
    check(paygrades, Array);
    if(Core.hasPayrollAccess(this.userId)){
        //get all paytypeId of all paygrades
        const gradeTypes = PayGrades.find({_id: {$in: paygrades}}).fetch();
        let paytypes = [];
        gradeTypes.forEach(x => {
            let assigned = x.payTypes.map(x => {
                return x.paytype;
            });
            paytypes = paytypes.concat(assigned);
        });
        const finalTypes = _.uniq(paytypes);
        return PayTypes.find({_id: {$in: finalTypes}, status: 'Active', frequency: "Annually", businessId: businessId});
    } else {
        return this.ready();
    }

});