Meteor.publish("WebHooks", function (group) {
    return WebHooks.find();
});



Meteor.publish("WebHook", function (id, group) {
    return WebHooks.findOne(id);
});