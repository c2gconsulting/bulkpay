/**
 * Paytypes publications
 */

Core.publish("emailsettings", function (businessId) {
    check(businessId, String);
    return EmailSettings.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Paytype
 */

Core.publish("emailsetting", function (id) {
    return EmailSettings.find({_id: id})
});
