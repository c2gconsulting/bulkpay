/**
 * CollectionFS - Image/Video Publication
 * @params {Array} tenants - array of current tenant object
 */
Core.publish("Media", function (tenants) {
  check(tenants, Match.Optional(Array));
  let selector;
  let tenantId = Core.getTenantId(this.userId);

  if (tenantId) {
    selector = {
      "metadata.tenantId": tenantId
    };
  }
  if (tenants) {
    selector = {
      "metadata.tenantId": {
        $in: tenants
      }
    };
  }
  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});



Core.publish("ObjectsMedia", function (objectType, objectId) {
  let selector;
  let tenantId = Core.getTenantId(this.userId);

  if (tenantId && objectId) {
    selector = {
      "tenantId": tenantId,
      "objectType": objectType,
      "objectId": objectId
    };
  }
  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});

Core.publish("UserImages", function (owner) {
  let selector;
  let tenantId = Core.getTenantId(this.userId);

  if (tenantId && owner) {
    selector = {
      "tenantId": tenantId,
      "owner": owner
    };
  }
  return UserImages.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});


Core.publish("OrderImages", function (orderId) {
  check(orderId, String);

  // look up the order
  let order = Orders.findOne({ _id: orderId });

  if (order) {
    let orderUsers = [this.userId];
    _.each(order.notes, function(note) {
      orderUsers.push(note.userId);
    });

    let selector;
    let tenantId = Core.getTenantId(this.userId);

    if (tenantId) {
      selector = {
        "tenantId": tenantId,
        "owner": {$in: orderUsers}
      };
    }
    return UserImages.find(selector, {
      sort: {
        "metadata.priority": 1
      }
    });
  }
  return this.ready();
});

Core.publish("ReturnOrderImages", function (returnOrderId) {
  check(returnOrderId, String);

  // look up the return order
  let returnOrder = ReturnOrders.findOne({ _id: returnOrderId });

  if (returnOrder) {
    let returnOrderUsers = [this.userId];
    _.each(returnOrder.notes, function(note) {
      returnOrderUsers.push(note.userId);
    });

    let selector;
    let tenantId = Core.getTenantId(this.userId);

    if (tenantId) {
      selector = {
        "tenantId": tenantId,
        "owner": {$in: returnOrderUsers}
      };
    }
    return UserImages.find(selector, {
      sort: {
        "metadata.priority": 1
      }
    });
  }
  return this.ready();
});


Core.publish("InvoiceImages", function (invoiceId) {
  check(invoiceId, String);

  // look up the invoice
  let invoice = Invoices.findOne({ _id: invoiceId });

  if (invoice) {
    let invoiceUsers = [this.userId];
    _.each(invoice.notes, function(note) {
      invoiceUsers.push(note.userId);
    });

    let selector;
    let tenantId = Core.getTenantId(this.userId);

    if (tenantId) {
      selector = {
        "tenantId": tenantId,
        "owner": {$in: invoiceUsers}
      };
    }
    return UserImages.find(selector, {
      sort: {
        "metadata.priority": 1
      }
    });
  }
  return this.ready();
});


Core.publish("PurchaseOrderImages", function (orderId) {
  check(orderId, String);

  // look up the order
  let order = PurchaseOrders.findOne({ _id: orderId });

  if (order) {
    let orderUsers = [this.userId];
    _.each(order.notes, function(note) {
      orderUsers.push(note.userId);
    });

    let selector;
    let tenantId = Core.getTenantId(this.userId);

    if (tenantId) {
      selector = {
        "tenantId": tenantId,
        "owner": {$in: orderUsers}
      };
    }
    return UserImages.find(selector, {
      sort: {
        "metadata.priority": 1
      }
    });
  }
  return this.ready();
});

Core.publish("StockTransferImages", function (id) {
  check(id, String);

  // look up the order
  let transfer = StockTransfers.findOne({ _id: id });

  if (transfer) {
    let transferUsers = [this.userId];
    _.each(transfer.notes, function(note) {
      transferUsers.push(note.userId);
    });

    let selector;
    let tenantId = Core.getTenantId(this.userId);

    if (tenantId) {
      selector = {
        "tenantId": tenantId,
        "owner": {$in: transferUsers}
      };
    }
    return UserImages.find(selector, {
      sort: {
        "metadata.priority": 1
      }
    });
  }
  return this.ready();
});