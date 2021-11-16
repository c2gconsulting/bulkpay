/**
 *  Employee Delegate Methods
 */
Meteor.methods({

    /* Employee Delegate
     */

    "employeedelegate/create": function(employeedelegate){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(employeedelegate, Core.Schemas.EmployeeDelegate);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the Delegate. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let employeedelegateId = EmployeeDelegates.insert(employeedelegate);
        return {_id: employeedelegateId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    "employeedelegate/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        EmployeeDelegates.remove({_id: id});
        return true;
    },
    "employeedelegate/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };

        delete details.createdAt
        const result = EmployeeDelegates.update(selector, {$set: details} );
        return result;
    }

});
