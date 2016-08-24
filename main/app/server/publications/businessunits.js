/**
 * BusinessUnit publications
 */

Core.publish("BusinessUnits", function () {
    //Meteor._sleepForMs(10000); simulate waiting for publication
    return BusinessUnits.find();
});

/**
 * Business units
 */

Core.publish("BusinessUnit", function (id) {
    return BusinessUnits.find({_id: id})
});