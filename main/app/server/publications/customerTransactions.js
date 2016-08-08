Core.publish("CustomerTransactions", function (id) {
    // retrieve locations user is authorized for
    let userGroups = Core.getAuthorizedGroups(this.userId, "customers/maintain");
    if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
        return CustomerTransactions.find({ customerId: id });
    } else {
        return this.ready();
    }
});


Core.publish("OrderHolds", function (orderNumber) {
    // retrieve locations user is authorized for
    let userGroups = Core.getAuthorizedGroups(this.userId, Core.Permissions.ADMIN_ALL);
    if (userGroups && _.isArray(userGroups) || userGroups === Roles.GLOBAL_GROUP) {
        return [CreditHolds.find({ orderNumber: orderNumber }), CustomerHolds.find({ orderNumber: orderNumber })];
    } else {
        return this.ready();
    }
});


Core.publish("CustomerTransactionsEx", function (id) {
    let self = this;

    let holdHandle = CustomerHolds.find({customerId: id}).observeChanges({
        added: function (id) {
            let doc = getHold(id);
            self.added("customertransactionsex", id, doc);
        },
        removed: function (id) {
            let doc = getHold(id);
            self.removed("customertransactionsex", id);
        },
        changed: function (id){
            let doc = getHold(id);
            self.changed("customertransactionsex", id, doc);
        }

    });

    let creditHoldHandle = CreditHolds.find({customerId: id}).observeChanges({
        added: function (id) {
            let doc = getCreditHold(id);
            self.added("customertransactionsex", id, doc);
        },
        removed: function (id) {
            let doc = getCreditHold(id);
            self.removed("customertransactionsex", id);
        },
        changed: function (id){
            let doc = getCreditHold(id);
            self.changed("customertransactionsex", id, doc);
        }
    });

    let transactionHandle = CustomerTransactions.find({customerId: id}).observeChanges({
        added: function (id) {
            let doc = getTrans(id);
            self.added("customertransactionsex", id, doc);
        },
        removed: function (id) {
            let doc = getTrans(id);
            self.removed("customertransactionsex", id);
        },
        changed: function (id){
            let doc = getTrans(id);
            self.changed("customertransactionsex", id, doc);
        }
    });

    self.ready();
    self.onStop(function () {
        holdHandle.stop();
        creditHoldHandle.stop();
        transactionHandle.stop();
    });
});

function getHold(id) {
    let customerHold = CustomerHolds.findOne(id);
    if (customerHold) {
        customerHold.postingDate = customerHold.createdAt;
        customerHold.transactionType = "hold";
        if (!customerHold.currency) {
        	let order = Orders.findOne(customerHold.orderId);
	        if (order) customerHold.currency = order.currency;
	    }
    }
    return customerHold
}

function getCreditHold(id) {
    let customerHold = CreditHolds.findOne(id);
    if (customerHold) {
        customerHold.postingDate = customerHold.createdAt;
        customerHold.transactionType = "credit hold";
        if (!customerHold.currency) {
	        let order = Orders.findOne(customerHold.orderId);
	        if (order) customerHold.currency = order.currency;
	    }
    }
    return customerHold
}

function getTrans(id) {
    let customerTransaction = CustomerTransactions.findOne(id);
    return customerTransaction
}