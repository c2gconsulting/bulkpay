Meteor.methods({

    "parseCurrenciesUpload": function(data, businessId, period){
        console.log('period', period);

        check(data, Array);
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

        for (let i = 0;i < data.length; i++) {
            let item   = data[i];
            //--
            let currencyCode = item.currencyCode;
            item.code = currencyCode;
            delete item.currencyCode;

            //rateToBaseCurrency is string, change to number
            let rateToBaseCurrency = parseFloat(item.rateToBaseCurrency);
            item.rateToBaseCurrency = rateToBaseCurrency;

            item.period = period;
            item.businessId = businessId;
            //--
            let currencyContext = Core.Schemas.Currency;
            try {
                currencyContext.validate(item);
            } catch(e){
                errors.push({line: i, error: e});
                errorCount += 1
            }
        }

        for ( let i = 0; i < data.length; i++ ) {
            let item   = data[ i ];
            let errorItem = _.find(errors, function (e) {
                return e.line === i
            });
            if (!errorItem) {
                let currency = Currencies.findOne({code: item.code, period: item.period});
                if (currency){
                    skippedCount += 1
                } else {
                    let newCurrencyId = Currencies.insert(item);
                    if (newCurrencyId){
                        successCount += 1
                    } else {
                        errorCount += 1
                    }
                }
            }
        }
        return {skipped: skippedCount, success: successCount, failed: errorCount}
    }
});
