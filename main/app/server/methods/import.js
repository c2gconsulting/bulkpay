Meteor.methods({

    /* paytype
     */

    "parseUpload": function( data,businessId, overwrite, period){
    console.log('overright', overwrite);
    console.log('period', period);
        check( data, Array );
        check(period, String);
        check(businessId, String);
        let errorCount = 0;
        let successCount = 0;
        let skippedCount = 0;
        let errors = [];
        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1){
                data.splice(index, 1);
            }
        });

        for ( let i = 0; i < data.length; i++ ) {
            let item   = data[ i ];

            let payTypeCode = item.paytype

            let fullPayTypeDetails = PayTypes.findOne({code: payTypeCode, businessId: businessId});
            if(!fullPayTypeDetails) {
                errors.push({line: i, error: `Pay type with code: ${payTypeCode} does not exist`});
                errorCount += 1
            }
            //amount is string, change to number
            let payTypeAmount = item.amount || "0"
            let payTypeAmountWithNoCommas = payTypeAmount.trim().replace(/,/g, "");

            item.amount = parseFloat(payTypeAmountWithNoCommas);
            //add period to item
            item.period = period;
            //add businessId
            item.businessId = businessId;
            let additionalPayContext = Core.Schemas.AdditionalPayment;
            try{
                additionalPayContext.validate(item);
            } catch(e){
                errors.push({line: i, error: e.message});
                errorCount += 1
            }
        }


        for ( let i = 0; i < data.length; i++ ) {
            let item   = data[ i ];
            let errorItem = _.find(errors, function (e) {
                return e.line === i
            });
            if (!errorItem) {
                let additionPay = AdditionalPayments.findOne({employee: item.employee, paytype: item.paytype, businessId: businessId});
                if (additionPay){
                    if (overwrite) {
                        AdditionalPayments.update(additionPay._id, {$set: item});
                        successCount += 1
                    } else skippedCount += 1
                } else {
                    let additionalPayId = AdditionalPayments.insert(item);
                    if (additionalPayId){
                        successCount += 1
                    } else {
                        errorCount += 1
                    }
                }
            }
        }

        return {skipped: skippedCount, success: successCount, failed: errorCount, errors: errors}

    }

});