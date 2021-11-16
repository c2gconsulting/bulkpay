/**
 *  Pension Manager Methods
 */
Meteor.methods({

    /* pension Manger
     */

    "staffCategory/create": function(staffCategory){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(staffCategory, Core.Schemas.StaffCategory);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the staffCategory. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let staffCategoryId = StaffCategories.insert(staffCategory);
        return {_id: staffCategoryId};
        //let newBu = BusinessUnits.findOne(buId);
        ////sendOrderNotification("order.created", newOrder, userId);
        //return { _id: orderId, orderNumber: newOrder.orderNumber };
        //} else {
        //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
        //}
    },
    
    "staffCategory/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        StaffCategories.remove({_id: id});
        return true;
    },
    "staffCategory/update": function(id, updatedStaffCategory){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = StaffCategories.update(selector, {$set: updatedStaffCategory} );
        return result;
    }

});
