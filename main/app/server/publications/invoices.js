/**
 * invoices
 */

Core.publish("Invoices", function (status, startDate, limit, sort) {
  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.INVOICES_VIEW);
  if (userGroups && _.isArray(userGroups)) {
    return Invoices.find({
      salesLocationId: { $in: userGroups },
      status: status,
      issuedAt: {
        $gte: startDate
      }
    }, 
        { fields: {
          customerName: 1,
          customerNumber: 1,
          invoiceNumber: 1,
          salesLocationId: 1,
          stockLocationId: 1,
          total: 1,
          status: 1,
          issuedAt: 1,
          customerId: 1,
          orderId: 1,
          orderNumber: 1,
          currency: 1
        },
          sort: sort, limit: limit } );
  } else if (userGroups === Roles.GLOBAL_GROUP) {
      return Invoices.find({
            status: status,
            issuedAt: {
              $gte: startDate
            }},
          { fields: {
            customerName: 1,
            customerNumber: 1,
            invoiceNumber: 1,
            salesLocationId: 1,
            stockLocationId: 1,
            total: 1,
            status: 1,
            issuedAt: 1,
            customerId: 1,
            orderId: 1,
            orderNumber: 1,
            currency: 1
          }, sort: sort, limit: limit });
  } else {
    return this.ready();
  }

});

/**
 * single invoice
 */

Core.publish("Invoice", function (id) {
  // retrieve item first before permission check to avoid multi-lookups
  let invoiceCursor = Invoices.find({ _id: id });
  let invoice = invoiceCursor.fetch();

  // if the entry exists and user is authorized for role and location, publish
  if (invoice.length > 0 &&  Core.hasInvoiceAccess(this.userId, invoice[0].salesLocationId, true)) {
    let orderCursor = Orders.find({_id: invoice[0].orderId},{ fields: { salesLocationId: 1, stockLocationId: 1, contactEmail: 1,
      contactPhone: 1, orderNumber: 1, paymentStatus: 1, appliedCredits: 1, currency: 1, total: 1, payments: 1 }, limit : 1});

    let variantIds = [];
    for (i in invoice[0].items) {
      variantIds[i] = invoice[0].items[i].variantId;
    }

    let order = orderCursor.fetch();

    return [
        invoiceCursor,
        orderCursor,
        ProductVariants.find({_id: { $in: variantIds }}, {
          fields: {
            'locations': 0
          }
        }),
        Customers.find({
          _id: invoice[0].customerId
        }, {
          fields: {
            'name': 1,
            'customerNumber': 1,
            'description': 1,
            'customerGroup': 1,
            'status': 1,
            'title': 1,
            'addressBook': 1,
            'email': 1,
            'url': 1,
            'customerType': 1,
            'direct': 1,
            'defaultTaxRate': 1,
            'defaultSalesLocationId': 1,
            'defaultPaymentTerm': 1,
            'creditTerms': 1,
            'account': { $slice: -1}
          }
        }),
        Payments.find({ 
            orderId: order[0]._id
          }),
        Meteor.users.find({
            _id: order[0].userId
        }, {
            fields: {
              'username': 1,
              'emails': 1,
              'profile': 1
            }
        })
      ];    
  }
  return this.ready(); 
  
});


/**
 * UnpaidInvoiceCount
 */
Core.publish("UnpaidInvoiceCount", function() {
  this.unblock(); // eliminate wait time impact

  let self = this;
  let count = 0;
  let initializing = true;
  let options = {
    status: "unpaid"
  };

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.INVOICES_VIEW);
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
  let handle = Invoices.find(options).observeChanges({
    added: function(id) {
      count++;
      if (!initializing)
        self.changed("counts", 'UNPAID_INVOICES', {
          count: count
        });
    },
    removed: function(id) {
      count--;
      self.changed("counts", "UNPAID_INVOICES", {
        count: count
      });
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'UNPAID_INVOICES', {
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


/**
 * OrderCount
 */
Core.publish("InvoiceCount", function (duration, status) {
  this.unblock(); // eliminate wait time impact
  
  let self = this;
  let count = 0;
  duration = duration || 1;
  let initializing = true;
  let issuedAtStart = moment().subtract(duration, 'months').toDate();
  let options = { issuedAt: {$gte: issuedAtStart}, status: status};
  let cStatus = (status).toUpperCase()

  // retrieve locations user is authorized for
  let userGroups = Core.getAuthorizedGroups(this.userId, "orders/manage");
  if (userGroups && _.isArray(userGroups)) {
    options.salesLocationId = { $in: userGroups };
  } else if (userGroups !== Roles.GLOBAL_GROUP) {
    return this.ready();
  }

  // observeChanges only returns after the initial `added` callbacks
  // have run. Until then, we don't want to send a lot of
  // `self.changed()` messages - hence tracking the
  // `initializing` state.
  let handle = Invoices.find(options).observeChanges({
    added: function (id) {
      count++;
      if (!initializing)
        self.changed("counts", 'INVOICES_' + cStatus + '_' +duration, {count: count});
    },
    removed: function (id) {
      count--;
      self.changed("counts", 'INVOICES_' + cStatus + '_' +duration, {count: count});
    }

  });

  // Send one `self.added()` message right after
  // observeChanges has returned, and mark the subscription as
  // ready.
  initializing = false;
  self.added("counts", 'INVOICES_' + cStatus + '_' +duration, {count: count});
  self.ready();

  // Stop observing the cursor when client unsubs.
  // Stopping a subscription automatically takes
  // care of sending the client any removed messages.
  self.onStop(function () {
    handle.stop();
  });
});

Core.publish("ManageInvoices", function (options, limit, sort) {
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
        'invoiceNumber': 1,
        'issuedAt': 1,
        'total': 1,
        'currency': 1,
        'approvalStatus': 1,
        'paymentStatus': 1,
        'assigneeId': 1,
        'orderId': 1,
        "items.variantId": 1
    };
    // retrieve locations user is authorized for

    let dates = options["issuedAt"];

    if (dates && dates["$gte"]){
        dates["$gte"] = moment(dates["$gte"]).startOf("day").tz(timezone).toDate()
    }

    if (dates && dates["$lte"]){
        dates["$lte"] = moment(dates["$lte"]).endOf('day').tz(timezone).toDate();
    }

    let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.INVOICES_VIEW);
    if (options && options["$or"] && options["$or"].length <= 0){
        delete options["$or"]
    }
    if (userGroups && _.isArray(userGroups)) {
        options["salesLocationId"] = { $in: userGroups };
        return Invoices.find(options, {
            fields: fields, sort: sort, limit: limit
        });
    } else if (userGroups === Roles.GLOBAL_GROUP) {
        return Invoices.find(options, {
            fields: fields, sort: sort, limit: limit
        });
    } else {
        return this.ready();
    }

});