/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "emailsetting/create": function(emailsetting){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(emailsetting, Core.Schemas.EmailSetting);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the hotel. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let emailsettingId = EmailSettings.insert(emailsetting);
        return {_id: emailsettingId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "emailsetting/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        emailsettings.remove({_id: id});
        return true;
    },
    "emailsetting/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = EmailSettings.update(selector, {$set: details} );
        return result;
    }

});
