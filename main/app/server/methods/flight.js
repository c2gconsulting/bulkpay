/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "flight/create": function(flight){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(flight, Core.Schemas.Flight);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the hotel. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let flightId = Flights.insert(flight);
        return {_id: flightId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "flight/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Flights.remove({_id: id});
        return true;
    },
    "flight/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Flights.update(selector, {$set: details} );
        return result;
    }

});
