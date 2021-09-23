/**
 *  Approval Config Methods
 */
Meteor.methods({

  /* Approval Config create
    */

  "approvalConfig/create": function(approvalConfig){
    if (!this.userId) {
        throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();

    try {
        check(approvalConfig, Core.Schemas.ApprovalsConfigs);
    } catch (e) {
        console.log(e);
        throw new Meteor.Error(401, "There's invalid data in the approvalConfig. Please correct and retry");
    }
    // if a bu object was provided and valid schema
    //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
    //    // must have orders/manage permissions
    this.unblock();

    let approvalConfigId = ApprovalsConfigs.insert(approvalConfig);
    return {_id: approvalConfigId};
    //let newBu = BusinessUnits.findOne(buId);
    ////sendOrderNotification("order.created", newOrder, userId);
    //return { _id: orderId, orderNumber: newOrder.orderNumber };
    //} else {
    //    throw new Meteor.Error(403, "You are not authorized to create an order for this location");
    //}
  },
  
  "approvalConfig/delete": function(id){
    if(!this.userId){
        throw new Meteor.Error(401, "Unauthorized");
    }
    // check if user has permission to delete
    ApprovalsConfigs.remove({_id: id});
    return true;
  },
  "approvalConfig/update": function(id, updatedHotel){
    if(!this.userId){
      throw new Meteor.Error(401, "Unauthorized");
    }
    //update can only be done by authorized user. so check permission
    check(id, String);
    const selector = {
      _id: id
    };
    const result = ApprovalsConfigs.update(selector, {$set: updatedHotel} );
    return result;
  },
  'approvalsConfig/getConfig': function (businessUnitId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    return ApprovalsConfigs.findOne({
      businessId: businessUnitId,
      $or: [
        {'approvals.approvalUserId': this.userId},
        {'approvals.approvalAlternativeUserId': this.userId}
      ]
    });
  }
});
