/**
 * Currencies publications
 */

Core.publish("currencies", function () {
    return Currencies.find();
});
