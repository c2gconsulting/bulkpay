Core.publish("Customers", function (status, limit) {
    status = status || 'active';
    // retrieve locations user is authorized for
    let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.CUSTOMERS_VIEW);
    if (userGroups && _.isArray(userGroups)) {
       return Customers.find({groupCode: { $in: userGroups}, status: status, blocked: false },
           { fields: {
               customerNumber: 1,
               name: 1, 
               status: 1,
               blocked: 1,
               createdAt: 1,
               groupCode: 1,
               defaultSalesLocationId: 1},
               limit: limit });
    } else if (userGroups === Roles.GLOBAL_GROUP) {
        return Customers.find({status: status, blocked: false},
            { fields: {
                customerNumber: 1,
                name: 1,
                status: 1,
                blocked: 1,
                createdAt: 1,
                groupCode: 1,
                defaultSalesLocationId: 1},
                limit: limit });
    } else {
        return this.ready();
    }
});


/**
 * single customer
 */

Core.publish("Customer", function (id) {
    // retrieve item first before permission check to avoid multi-lookups
    let customerCursor = Customers.find({ _id: id });
    let customer = customerCursor.fetch();
    // if the entry exists and user is authorized for role and group, publish
    if (customer.length > 0 && Core.hasCustomerAccess(this.userId, customer[0].groupCode, true)) {
        return [
            customerCursor,
            CustomerTransactions.find({
                customerId: customer[0]._id
            }),
            Orders.find({customerId: customer[0]._id, status: {$ne: 'cancelled'}},{ fields: { status: 1, createdAt: 1, issuedAt: 1, orderNumber: 1, customerId: 1, total: 1 }, sort: {orderNumber: -1}, limit : 5}),
            CustomerGroups.find({code: customer[0].groupCode}),
            CreditHolds.find({customerId: customer[0]._id}),
            CustomerHolds.find({customerId: customer[0]._id})
        ];
    }

    return this.ready();

});

/**
 * customer groups
 */
Core.publish("CustomerGroups", function() {
    return CustomerGroups.find();
}) 

/**
 * Customer for order creation
 */

Core.publish("OrderCustomer", function (customerId) {
    this.unblock(); // eliminate wait time impact

    if (Core.hasCustomerAccess(this.userId, null, true)) {
        return [ 
            Customers.find({ _id: customerId, blocked: { $ne: true } }),
            CreditHolds.find({customerId: customerId}),
            CustomerHolds.find({customerId: customerId})
        ];
    } else return this.ready();
});

/**
 * Count for Customers Awaiting approval
 */
Core.publish("PendingCustomerCount", function () {
    this.unblock(); // eliminate wait time impact

    let self = this;
    let count = 0;
    let initializing = true;
    let options = { status: "pending"};

    // retrieve locations user is authorized for
    let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.CUSTOMERS_VIEW);
    if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
        // observeChanges only returns after the initial `added` callbacks
        // have run. Until then, we don't want to send a lot of
        // `self.changed()` messages - hence tracking the
        // `initializing` state.
        let handle = Customers.find(options).observeChanges({
            added: function (id) {
                count++;
                if (!initializing)
                    self.changed("counts", 'PENDING_CUSTOMERS', {count: count});
            },
            removed: function (id) {
                count--;
                self.changed("counts", "PENDING_CUSTOMERS", {count: count});
            }

        });

        // Send one `self.added()` message right after
        // observeChanges has returned, and mark the subscription as
        // ready.
        initializing = false;
        self.added("counts", 'PENDING_CUSTOMERS', {count: count});
        self.ready();

        // Stop observing the cursor when client unsubs.
        // Stopping a subscription automatically takes
        // care of sending the client any removed messages.
        self.onStop(function () {
            handle.stop();
        });
    } else {
        return this.ready();
    }
});

/**
 * Count for Total Customers
 */
Core.publish("TotalCustomerCount", function () {
    this.unblock(); // eliminate wait time impact

    let self = this;
    let count = 0;
    let initializing = true;
    let options = {};

    // observeChanges only returns after the initial `added` callbacks
    // have run. Until then, we don't want to send a lot of
    // `self.changed()` messages - hence tracking the
    // `initializing` state.
    let handle = Customers.find(options).observeChanges({
        added: function (id) {
            count++;
            if (!initializing)
                self.changed("counts", 'TOTAL_CUSTOMERS', {count: count});
        },
        removed: function (id) {
            count--;
            self.changed("counts", "TOTAL_CUSTOMERS", {count: count});
        }

    });

    // Send one `self.added()` message right after
    // observeChanges has returned, and mark the subscription as
    // ready.
    initializing = false;
    self.added("counts", 'TOTAL_CUSTOMERS', {count: count});
    self.ready();

    // Stop observing the cursor when client unsubs.
    // Stopping a subscription automatically takes
    // care of sending the client any removed messages.
    self.onStop(function () {
        handle.stop();
    });

});


/**
 * Customer for purchase order creation
 */

Core.publish("SupplierCustomer", function (supplierId) {
    this.unblock(); // eliminate wait time impact
    let cursors;
    let supplier = Suppliers.findOne(supplierId);
    if (supplier && supplier.companyId){
        let company = Companies.findOne(supplier.companyId);
        if (company && company.tenantId){
            Partitioner.bindGroup(company.tenantId, function(){
                let customerCursor = Customers.find({ companyId: company._id, blocked: { $ne: true } });
                let customer = customerCursor.fetch();
                if (customer && customer.length > 0 ){
                    cursors = [
                        customerCursor,
                        CreditHolds.find({customerId: customer[0]._id}),
                        CustomerHolds.find({customerId: customer[0]._id})
                    ];
                }
            });
        }
    }
    
    if (cursors){
        return cursors
    } else return this.ready();

});
