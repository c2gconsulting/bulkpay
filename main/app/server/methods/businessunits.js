/**
 *  BusinessUnit Methods
 */
Meteor.methods({

    /* business unit create
     *
     *
     *
     */

    "businessunit/create": function(bu) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        console.log(bu);

        try {
            check(bu, Core.Schemas.BusinessUnit);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the business unit. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let buId = BusinessUnits.insert(bu);
        return {_id: buId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    }

});

