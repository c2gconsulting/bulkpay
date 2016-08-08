/**
 * orders
 */

Core.publish("Orders", function (filter, limit, sort) {
  let fields = {
    'customerId': 1,
    'customerNumber': 1,
    'customerName': 1,
    'contactEmail': 1,
    'contactPhone': 1,
    'userId': 1,
    'approvalStatus': 1,
    'status': 1,
    'salesLocationId': 1,
    'stockLocationId': 1,
    'orderNumber': 1,
    'issuedAt': 1,
    'shipAt': 1,
    'createdAt': 1,
    'subtotal': 1,
    'total': 1,
    'orderType': 1,
    'isPickup': 1,
    'taxRate': 1,
    'shippingStatus': 1,
    'currency': 1,
    'billingAddressId': 1,
    'shippingAddressId': 1,
    'priceListCode': 1,
    'reference': 1,
    'paymentStatus': 1,
    'items': 1
  };
  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.ORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    filter["salesLocationId"] = { $in: userGroups };
    return Orders.find(filter, {
      fields: fields, sort: sort, limit: limit
    });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return Orders.find(filter,{
            fields: fields, sort: sort, limit: limit
          });
  } else {
    return this.ready();
  }

});

/**
 * single order
 */

Core.publish("Order", function (id) {
  let orderCursor = Orders.find({ _id: id });
  let order = orderCursor.fetch();
  // if the entry exists and user is authorized for role and location, publish
  if (order[0]){
    if (order.length > 0 && Core.hasOrderAccess(this.userId, order[0].salesLocationId), true) {
      //extract order items variants
      let variantIds = [];
      for (i in order[0].items) {
        variantIds[i] = order[0].items[i].variantId;
      }

      // extract priceListCodes
      let priceListCodes = [];
      let priceListGroup = PriceListGroups.findOne({ code: order.priceListCode });
      if (priceListGroup) priceListCodes = priceListGroup.priceListCodes;

      return [
        orderCursor,
        Customers.find({
          _id: order[0].customerId
        }),
        Invoices.find({
          orderId: order[0]._id
        }),
        ReturnOrders.find({
          orderId: order[0]._id
        }),
        CustomerHolds.find({customerId: order[0].customerId}),
        CreditHolds.find({customerId: order[0].customerId}),
        Payments.find({
          orderId: order[0]._id
        }),
        Meteor.users.find({ $or: [
          { _id: order[0].userId },
          { _id: order[0].assigneeId }
        ]}, {
          fields: {
            'username': 1,
            'emails': 1,
            'profile': 1,
            'salesProfile': 1
          }
        })
      ];
    }
  }
  return this.ready();

});


/*
 * account orders
 */

Core.publish("AccountOrders", function (userId, currentTenantId) {
  check(userId, Match.OptionalOrNull(String));
  check(currentTenantId, Match.OptionalOrNull(String));
  tenantId = currentTenantId || Core.getTenantId(this);

  if (userId && userId !== this.userId) {
    this.ready();
  }

  return Orders.find({
    tenantId: tenantId,
    userId: this.userId
  });
});

/**
 * orderTypes
 */

Core.publish("OrderTypes", function () {
  return OrderTypes.find({}, { sort: { sort: 1 }});
});


/**
 * OpenOrderCount
 */
Core.publish("OpenOrderCount", function () {
  this.unblock(); // eliminate wait time impact

  let self = this;
  let count = 0;
  let initializing = true;
  let options = { status: "open"};

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.ORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = { $in: userGroups };
  } else if (userGroups !== Roles.GLOBAL_GROUP) {
    return this.ready();
  }

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = Orders.find(options).observeChanges({
    added: function (id) {
      count++;
      if (!initializing)
        self.changed("counts", 'OPEN_ORDERS', {count: count});
    },
    removed: function (id) {
      count--;
      self.changed("counts", "OPEN_ORDERS", {count: count});
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'OPEN_ORDERS', {count: count});
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function () {
    handle.stop();
  });
});


/**
 * OrderCount
 */
Core.publish("OrderCount", function (duration, status) {
  this.unblock(); // eliminate wait time impact

  let self = this;
  let count = 0;
  duration = duration || 1;
  let initializing = true;
  let issuedAtStart = moment().subtract(duration, 'months').toDate();
  let options = { issuedAt: {$gte: issuedAtStart}, status: status};
  let cStatus = (status).toUpperCase()

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.ORDERS_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = { $in: userGroups };
  } else if (userGroups !== Roles.GLOBAL_GROUP) {
    return this.ready();
  }

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = Orders.find(options).observeChanges({
    added: function (id) {
      count++;
      if (!initializing)
        self.changed("counts", 'ORDERS_' + cStatus + '_' +duration, {count: count});
    },
    removed: function (id) {
      count--;
      self.changed("counts", 'ORDERS_' + cStatus + '_' +duration, {count: count});
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'ORDERS_' + cStatus + '_' +duration, {count: count});
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function () {
    handle.stop();
  });
});

/**
 * TotalOrderCount
 */
Core.publish("TotalOrderCount", function () {
  this.unblock(); // eliminate wait time impact
  
  let self = this;
  let count = 0;
  let initializing = true;
  let options = {};

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = Orders.find(options).observeChanges({
    added: function (id) {
      count++;
      if (!initializing)
        self.changed("counts", 'TOTAL_ORDERS', {count: count});
    },
    removed: function (id) {
      count--;
      self.changed("counts", "TOTAL_ORDERS", {count: count});
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'TOTAL_ORDERS', {count: count});
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function () {
    handle.stop();
  });
});


/**
 * CashPaymentMethods
 */
Core.publish("CashPaymentMethods", function () {
  return PaymentMethods.find({isCashInHand: true}, { sort: { sort: 1 }});
});


Core.publish("ManageOrders", function (options, limit, sort) {
  let userId = this.userId;
  let timezone = Core.getTimezone(userId);
  let fields = {
    'customerName': 1,
    customerId: 1,
    'userId': 1,
    'status': 1,
    'stockLocationId': 1,
    'salesLocationId': 1,
    'orderNumber': 1,
    'issuedAt': 1,
    'total': 1,
    'orderType': 1,
    'currency': 1,
    'approvalStatus': 1,
    'paymentStatus': 1,
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

  
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.ORDERS_VIEW);
  if (options && options["$or"] && options["$or"].length <= 0){
    delete options["$or"]
  }
  if (userGroups && _.isArray(userGroups)) {
      options["salesLocationId"] = { $in: userGroups };
       return Orders.find(options, {
         fields: fields, sort: sort, limit: limit
       });
  } else if (userGroups === Roles.GLOBAL_GROUP) {
    return Orders.find(options, {
      fields: fields, sort: sort, limit: limit
    });
  } else {
    return this.ready();
  }

});