

/**
 * Employee
 * Publish profile of Employee
 *
 * @params {String} business id -  view users for this business
 */

Core.publish("employees", function (node,businessId) {
    this.unblock(); // eliminate wait time impact

    let selector = {};
    let nodeSelector = {};

    node = node == "root"? null : node;
    nodeSelector = {$and: [{"parentId": node},{otype: "Position"},{businessId: businessId}]};

    //get all entities of node
    let entities = EntityObjects.find(nodeSelector).map(x => {
        return x._id;
    });
    selector = { "businessIds": businessId, "employeeProfile.position": {$in: entities}, "employee":true };

    if (entities){
        //return all meteor users in that position
        return [Meteor.users.find(selector, {
            fields: {
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true
            }
        }),UserImages.find({})];
    } else {
        return this.ready();
    }

});
Core.publish("allEmployees", function (businessId) {
    this.unblock(); // eliminate wait time impact
    let selector = { "businessIds": businessId, employee: true };
    check(businessId, String);
    if (businessId){
        //return all meteor users in that position
        return [Meteor.users.find(selector, {
            fields: {
                "emails": true,
                "employee": true,
                "profile": true,
                "employeeProfile": true,
                "username": true
            }
        }),
        UserImages.find({})];
    } else {
        return this.ready();
    }

});


Core.publish("SalesUsers", function (salesArea) {
    this.unblock(); // eliminate wait time impact

    let selector = {};
    if (salesArea) {
        selector = { "salesProfile.salesAreas": salesArea };
    }
    return Meteor.users.find(selector, {
        fields: {
            "emails": true,
            "profile": true,
            "salesProfile": true,
            "username": true
        }
    });
});

/**
 * OrderUsers
 * Publish profile of users relevant to an order
 *
 * @params {String} orderId -  view users for this order
 */

Core.publish("OrderUsers", function (orderId) {
    check(orderId, String);

    // look up the order
    let order = Orders.findOne({ _id: orderId });

    if (order) {
        let orderUsers = [order.userId, order.assigneeId];
        _.each(order.history, function(activity) {
            orderUsers.push(activity.userId);
        });

        _.each(order.notes, function(note) {
            orderUsers.push(note.userId);
        });

        return Meteor.users.find({ _id: { $in: orderUsers }
        }, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true
            }
        });
    }
    return this.ready();
});



/**
 * ReturnOrderUsers
 * Publish profile of users relevant to a return order
 *
 * @params {String} returnOrderId -  view users for this returnorder
 */

Core.publish("ReturnOrderUsers", function (returnOrderId) {
    check(returnOrderId, String);

    // look up the return order
    let returnOrder = ReturnOrders.findOne({ _id: returnOrderId });

    if (returnOrder) {
        let returnOrderUsers = [returnOrder.userId, returnOrder.assigneeId];
        _.each(returnOrder.history, function(activity) {
            returnOrderUsers.push(activity.userId);
        });

        _.each(returnOrder.notes, function(note) {
            returnOrderUsers.push(note.userId);
        });

        return Meteor.users.find({ _id: { $in: returnOrderUsers }
        }, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true
            }
        });
    }
    return this.ready();
});

/**
 * InvoiceUsers
 * Publish profile of users relevant to an invoice
 *
 * @params {String} invoiceId -  view users for this invoice
 */

Core.publish("InvoiceUsers", function (invoiceId) {
    check(invoiceId, String);

    // look up the order
    let invoice = Invoices.findOne({ _id: invoiceId });

    if (invoice) {
        let invoiceUsers = [invoice.userId];
        _.each(invoice.history, function(activity) {
            invoiceUsers.push(activity.userId);
        });

        _.each(invoice.notes, function(note) {
            invoiceUsers.push(note.userId);
        });

        return Meteor.users.find({ _id: { $in: invoiceUsers }
        }, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true
            }
        });
    }
    return this.ready();
});



/**
 * CustomerDefaultAssignee
 * Publish profile of the customer's default salesperson
 *
 * @params {String} customerId -  view the default user for this customer
 */

Core.publish("CustomerDefaultAssignee", function (customerId) {
    this.unblock(); // eliminate wait time impact

    check(customerId, String);

    // look up the customer
    let customer = Customers.findOne({ _id: customerId });

    if (customer && customer.defaultAssigneeId) {
        return Meteor.users.find({ _id: customer.defaultAssigneeId }, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true
            }
        });
    }
    return this.ready();

});

/**
 * Users
 * Publish profile of  users
 *
 */

Core.publish("Users", function (sort, limit) {

    if (Core.hasAdminAccess(this.userId)) {
        sort = sort || {};
        limit = limit || 24;
        return Meteor.users.find({}, {
            fields: {
                "emails": true,
                "profile": true,
                "salesProfile": true,
                "username": true,
                "createdAt": true
            }, sort: sort, limit: limit
        });
    }
    return this.ready();
});

/**
 * User
 * Publish profile of  user
 *
 */

Core.publish("User", function (id) {
    if (Core.hasAdminAccess(this.userId) || this.userId === id) {
        return Meteor.users.find({_id: id});
    } else {
        return this.ready();
    }
});