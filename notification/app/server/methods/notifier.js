

/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/renderMessage": function (object) {
        this.unblock();
        object = JSON.parse(object);
        Meteor.call(Core.eventMap[object.event], object);
    }
});

