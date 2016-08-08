/**
 * locations
 */
Core.publish("Locations", function () {
  return Locations.find({
    status: "active"
  });
});

Core.publish("UserLocations", function () {
  let userGroups = Core.getAuthorizedGroups(this.userId,  Core.Permissions.ORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    return Locations.find({
      status: "active",
      _id: { $in: userGroups }
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return Locations.find({
      status: "active"
    }); 
  } else {
      return this.ready();    
  }
});

Core.publish("Location", function (id) {
  return Locations.find({
    _id: id
  });
});


/**
 * locations
 */
Core.publish("SupplierLocations", function (supplierId) {
  this.unblock(); // eliminate wait time impact

  let supplier = Companies.findOne(supplierId);
  let cursors;

  if (supplier){
    Partitioner.bindGroup(supplier.tenantId, function(){
      if (supplier){
        cursors = Locations.find({
          status: "active"
        });
      }
    });
  }

  if (cursors){
    return cursors
  } else return this.ready();

});