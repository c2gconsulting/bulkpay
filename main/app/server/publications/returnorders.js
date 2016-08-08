/**
 * returnorders
 */

Core.publish("ReturnOrders", function(status, startDate, limit, sort) {
  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.RETURNORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    return ReturnOrders.find({
      status: status,
      salesLocationId: {
        $in: userGroups
      },
      issuedAt: {
        $gte: startDate
      }
    }, {
      fields: {
        'orderNumber': 1,
        'returnOrderNumber': 1,
        'status': 1,
        'issuedAt': 1,
        'total': 1,
        'customerNumber': 1,
        'customerName': 1,
        'customerId': 1,
        'orderId': 1,
        'currency': 1
      }, sort: sort, limit: limit
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return ReturnOrders.find({status: status,
      issuedAt: {
      $gte: startDate}
    }, {
      fields: {
        'orderNumber': 1,
        'returnOrderNumber': 1,
        'status': 1,
        'issuedAt': 1,
        'total': 1,
        'customerNumber': 1,
        'customerName': 1,
        'customerId': 1,
        'orderId': 1,
        'currency': 1
      }, sort: sort, limit: limit
    });
  } else {
    return this.ready();
  }

});


/**
 * single returnorder
 */

Core.publish("ReturnOrder", function(id) {
  // retrieve item first before permission check to avoid multi-lookups
  let returnOrderCursor = ReturnOrders.find({
    _id: id
  });
  let returnOrder = returnOrderCursor.fetch();
  // if the entry exists and user is authorized for role and location, publish
  if (returnOrder.length > 0 && Core.hasReturnOrderAccess(this.userId, returnOrder[0].salesLocationId, true)) {

    //extract returnorder items variants
    let variantIds = [];
    for (i in returnOrder[0].items) {
      variantIds[i] = returnOrder[0].items[i].variantId;
    }

    return [
      returnOrderCursor,
      Orders.find({
        _id: returnOrder[0].orderId
      }, {
        fields: {
          'billingAddressId': 1,
          'shippingAddressId': 1,
          'orderType': 1,
          'shipAt': 1,
          'priceListCode': 1,
          'appliedCredits': 1,
          'cashPayments': 1,
          'total': 1
        }
      }),
      ProductVariants.find({
        _id: {
          $in: variantIds
        }
      }, {
        fields: {
          'locations': 0
        }
      }),
      Customers.find({
        _id: returnOrder[0].customerId
      }, {
        fields: {
          'addressBook': 1,
          'customerGroup': 1,
          'customerNumber': 1
        }
      })
    ];
  }
  return this.ready();

});


/*
 * account returnorders
 */

Core.publish("AccountReturnOrders", function(userId, currentTenantId) {
  check(userId, Match.OptionalOrNull(String));
  check(currentTenantId, Match.OptionalOrNull(String));
  tenantId = currentTenantId || Core.getTenantId(this);

  if (userId && userId !== this.userId) {
    this.ready();
  }

  return ReturnOrders.find({
    tenantId: tenantId,
    userId: this.userId
  });
});

/**
 * returnReasons
 */

Core.publish("ReturnReasons", function () {
  return ReturnReasons.find({});
});

/**
 * PendingReturnCount
 */
Core.publish("PendingReturnCount", function() {
  this.unblock(); // eliminate wait time impact

  let self = this;
  let count = 0;
  let initializing = true;
  let options = {
    status: "pending"
  };

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.RETURNORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = {
      $in: userGroups
    };
  } else if (userGroups !== Roles.GLOBAL_GROUP) {
    return this.ready();
  }

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = ReturnOrders.find(options).observeChanges({
    added: function(id) {
      count++;
      if (!initializing)
        self.changed("counts", 'PENDING_RETURNS', {
          count: count
        });
    },
    removed: function(id) {
      count--;
      self.changed("counts", "PENDING_RETURNS", {
        count: count
      });
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'PENDING_RETURNS', {
    count: count
  });
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function() {
    handle.stop();
  });
});


Core.publish("ReturnOrderCount", function (duration, status) {
  this.unblock(); // eliminate wait time impact

  let self = this;
  let count = 0;
  duration = duration || 1;
  let initializing = true;
  let issuedAtStart = moment().subtract(duration, 'months').toDate();
  let options = { issuedAt: {$gte: issuedAtStart}, status: status};
  let cStatus = (status).toUpperCase()

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.RETURNORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = { $in: userGroups };
  } else if (userGroups !== Roles.GLOBAL_GROUP) {
    return this.ready();
  }

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = ReturnOrders.find(options).observeChanges({
    added: function (id) {
      count++;
      if (!initializing)
        self.changed("counts", 'RETURN_ORDERS_' + cStatus + '_' +duration, {count: count});
    },
    removed: function (id) {
      count--;
      self.changed("counts", 'RETURN_ORDERS_' + cStatus + '_' +duration, {count: count});
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'RETURN_ORDERS_' + cStatus + '_' +duration, {count: count});
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function () {
    handle.stop();
  });
});

Core.publish("ManageReturns", function (options, limit, sort) {
  let userId = this.userId;
  let timezone = Core.getTimezone(userId);
  let fields = {
    'customerName': 1,
    'customerId': 1,
    'userId': 1,
    'status': 1,
    'stockLocationId': 1,
    'salesLocationId': 1,
    'returnOrderNumber': 1,
    'issuedAt': 1,
    'total': 1,
    'currency': 1,
    'assigneeId': 1,
    "items.variantId": 1
  };
  // retrieve locations user is authorized for

  let dates = options["issuedAt"];

  if (dates && dates["$gte"]){
    dates["$gte"] = moment(dates["$gte"]).startOf("day").tz(timezone)._d;
  }

  if (dates && dates["$lte"]){
    dates["$lte"] = moment(dates["$lte"]).endOf('day').tz(timezone)._d;
  }
  if (options && options["$or"] && options["$or"].length <= 0){
    delete options["$or"]
  }
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.RETURNORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = {$in: userGroups};
    return ReturnOrders.find(options, {
      fields: fields, sort: sort, limit: limit
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return ReturnOrders.find(options, {
      fields: fields, sort: sort, limit: limit
    });
  } else {
    return this.ready();
  }

});