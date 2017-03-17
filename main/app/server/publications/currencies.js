/**
 * Currencies publications
 */

Core.publish("currenciesForPeriod", function (period) {
    return Currencies.find({period: period});
});
