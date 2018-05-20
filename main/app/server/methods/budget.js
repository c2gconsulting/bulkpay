/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "budget/create": function(budget){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(budget, Core.Schemas.Budget);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the budget. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let budgetId = Budgets.insert(budget);
        return {_id: budgetId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "budget/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        Budgets.remove({_id: id});
        return true;
    },
    "budget/update": function(id, newBudget){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = Budgets.update(selector, {$set: newBudget} );
        return result;
    }

});
