/**
 *  payGroup Methods
 */
Meteor.methods({

    /* payGroup
     */

    "payGroup/create": function(paygroup){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(paygroup, Core.Schemas.PayGroup);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the payGroups. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let pgId = PayGroups.insert(paygroup);
        return {_id: pgId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "payGroup/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        PayGroups.remove({_id: id});
        return true;
    },
    "payGroup/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = PayGroups.update(selector, {$set: details} );
        return result;
    }

});

