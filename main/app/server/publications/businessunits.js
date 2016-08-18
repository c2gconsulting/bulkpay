/**
 * BusinessUnit publications
 */

Core.publish("BusinessUnits", function () {
    return BusinessUnits.find();
});

/**
 * Business units
 */

Core.publish("BusinessUnit", function (id) {
    return BusinessUnits.find({_id: id})
});