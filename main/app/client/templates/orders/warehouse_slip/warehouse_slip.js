/*****************************************************************************/
/* WarehouseSlip: Event Handlers */
/*****************************************************************************/
import accounting from 'accounting';
Template.WarehouseSlip.events({
});

/*****************************************************************************/
/* WarehouseSlip: Helpers */
/*****************************************************************************/
Template.WarehouseSlip.helpers({
    shippingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.shippingAddressId });
    },
    commercialAddress: function() {
        return _.findWhere(Tenants.findOne(Core.tenantId).addressBook, { isCommercial: true });
    },
    billingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.billingAddressId });
    },
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    standardItems: function() {
        return _.filter(this.items, function(el) { return !el.isPromo; });
    },
    promoItems: function() {
        return _.filter(this.items, function(el) { return el.isPromo; });
    },
    cSubTotal: function() {
        return this.subTotal
    },
    cTaxes: function() {
        return this.taxes
    },
    cTotal: function() {
        return this.total
    },
    totalDue: function() {
        let totalDue = this.balance()
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
    creditTerms: function(){
        let customer = Customers.findOne(this.customerId);
        if (customer){
            return customer.creditTerms
        }
    }
});

/*****************************************************************************/
/* WarehouseSlip: Lifecycle Hooks */
/*****************************************************************************/
Template.WarehouseSlip.onCreated(function () {
    this.state = new ReactiveDict();

    let self = this;
    this.autorun(function () {
        self.subscribe('VariantsForOrder', Template.parentData()._id);
        self.subscribe('OrderHolds', Template.parentData().orderNumber);
        UserSubs.subscribe('OrderUsers', Template.parentData()._id);
    });
});

Template.WarehouseSlip.onRendered(function () {
    setTimeout(window.print, 2000);
});

Template.WarehouseSlip.onDestroyed(function () {
});
