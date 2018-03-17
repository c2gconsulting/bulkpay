/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "airline/create": function(airline){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(airline, Core.Schemas.Airline);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the hotel. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let AirlineId = Airlines.insert(airline);
        return {_id: airlineId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "airline/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Airlines.remove({_id: id});
        return true;
    },
    "airline/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Airlines.update(selector, {$set: details} );
        return result;
    }

});
