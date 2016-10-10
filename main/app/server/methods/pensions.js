/**
 *  Pension Methods
 */
Meteor.methods({

    /* pension
     */

    "pension/create": function(paytype){
        console.log(paytype);
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(paytype, Core.Schemas.Pension);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the paytype. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let pensionId = Pensions.insert(paytype);
        return {_id: pensionId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "pension/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Pensions.remove({_id: id});
        return true;
    },
    "pension/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Pensions.update(selector, {$set: details} );
        return result;
    }

});

