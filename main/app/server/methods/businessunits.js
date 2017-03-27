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
    },
    "businessunit/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and all dependent objects are cleared
        BusinessUnits.remove({_id: id});
        return true;
    },
    "businessunit/getEmployeeNumber": function(businessUnitId) {
      if(!this.userId){
          throw new Meteor.Error(401, "Unauthorized");
      }
      if(BusinessUnits.findOne({_id: businessUnitId})){
        let employeeCount = Meteor.users.find({businessIds: {$in: [businessUnitId]}}).count();
        // console.log(`Employee count: ${employeeCount}`)

        return employeeCount
      } else
        throw new Meteor.Error(404, "Business does not exist");
    }
});
