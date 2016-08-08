/*****************************************************************************/
/* InvoicePrint: Event Handlers */
/*****************************************************************************/
Template.InvoicePrint.events({
});

/*****************************************************************************/
/* InvoicePrint: Helpers */
/*****************************************************************************/
Template.InvoicePrint.helpers({
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.orderPrice) * ((100 - discount)/100);
    },

    order: function() {
        return Orders.findOne(this.orderId);
    },
    commercialAddress: function() {
        return _.findWhere(Tenants.findOne(Core.tenantId).addressBook, { isCommercial: true });
    },
    invoiceNotes: function() {
        return  _.sortBy(this.notes, function(note) { return -note.createdAt; })
    },
    standardItems: function() {
        return _.filter(this.items, function(el) { return !el.isPromo; });
    },
    promoItems: function() {
        return _.filter(this.items, function(el) { return el.isPromo; });
    },
    textFormat: function(text){
        if (text === 'CREATE') return 'invoice has been created';
        if (text === 'STATUS_CHANGE') return 'invoice status changed to' + this.status;
    },
    shippingAddress: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) return _.findWhere(customer.addressBook, { _id: this.shippingAddressId });
    },
    billingAddress: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) return _.findWhere(customer.addressBook, { _id: this.billingAddressId });
    },
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    cSubTotal: function() {
        discount = this.discounts || 0;
        let subTotal = 0;
        for (i in this.items) {
            d = this.items[i].discount || 0;
            subTotal += (this.items[i].quantity * this.items[i].price) * ((100 - d)/100);
        }
        let ans = subTotal + this.taxes - discount;
        return ans;
    },
    iSubTotal: function() {
        discount = this.discounts || 0;
        let subTotal = 0;
        for (i in this.items) {
            d = this.items[i].discount || 0;
            subTotal += (this.items[i].quantity * this.items[i].price) * ((100 - d)/100);
        }
        let ans = subTotal - discount;
        return ans;
    },
    totalDue: function() {
        let order = Orders.findOne(this.orderId);
        let totalDue = order.balance()
        return totalDue < 0 ? 0 : totalDue;
    },
    creditLimit: function(){
        let customer =  Customers.findOne(this.customerId);
        if (customer && customer.creditLimit){
            return customer.creditLimit
        } else {
            return 0
        }
    },

    creditTerms: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) {
            return customer.creditTerms
        }
    }

});

/*****************************************************************************/
/* InvoicePrint: Lifecycle Hooks */
/*****************************************************************************/
Template.InvoicePrint.onCreated(function () {
});

Template.InvoicePrint.onRendered(function () {
    setTimeout(window.print, 2000);
});

Template.InvoicePrint.onDestroyed(function () {
});
