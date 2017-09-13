Meteor.methods({

    /* paytype
     */

    "parseUpload": function( data,businessId, overwrite, period){
        check( data, Array );
        check(period, String);
        check(businessId, String);

        let successCount = 0;
        let skipped = [];
        let skippedCount = 0;
        let errorCount = 0;
        let errors = [];

        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1){
                data.splice(index, 1);
            }
        });

        //-- ----------
        let dataLength = data.length;
        for ( let i = 0; i < dataLength; i++ ) {
            let item   = data[ i ];

            let payTypeCode = item.paytype

            let fullPayTypeDetails = PayTypes.findOne({code: payTypeCode, businessId: businessId});
            if(!fullPayTypeDetails) {
                item.line = i
                item.error = `Pay type with code: ${payTypeCode} does not exist`
                errors.push(item);
                errorCount += 1
                continue;
            }
            //amount is string, change to number
            let payTypeAmount = item.amount || "0"
            // let payTypeAmountWithNoCommas = payTypeAmount.trim().replace(/(,|\")/g, "");
            let payTypeAmountWithNoCommas = payTypeAmount.trim().replace(/[,\"]/g, "")

            item.amount = parseFloat(payTypeAmountWithNoCommas);
            //add period to item
            item.period = period;
            //add businessId
            item.businessId = businessId;
            let additionalPayContext = Core.Schemas.AdditionalPayment;
            try{
                additionalPayContext.validate(item);
            } catch(e){
                item.line = i
                item.error = e.message
                errors.push(item);
                errorCount += 1
                continue;
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
                    } else {
                        item.line = i
                        item.error = `Paytype with code: ${item.paytype} already exists and overwrite NOT enabled`
                        skipped.push(item);
                        skippedCount += 1
                    }
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

        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});