/**
 * Attachments publications
 */

Meteor.publish("attachments", function (businessId) {
    check(businessId, String);
    return Attachments.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Attachment
 */

Core.publish("attachment", function (id) {
    return Attachments.find({_id: id})
});
