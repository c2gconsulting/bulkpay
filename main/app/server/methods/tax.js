/**
 *  Tax Methods
 */
Meteor.methods({

    /* tax
     */

    "tax/create": function(tax){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(tax, Core.Schemas.Tax);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the tax. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let taxId = Tax.insert(tax);
        return {_id: taxId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "tax/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Tax.remove({_id: id});
        return true;
    },
    "tax/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Tax.update(selector, {$set: details} );
        return result;
    }

});

