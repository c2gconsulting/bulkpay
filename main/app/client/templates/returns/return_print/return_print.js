/*****************************************************************************/
/* ReturnPrint: Event Handlers */
/*****************************************************************************/
Template.ReturnPrint.events({});

/*****************************************************************************/
/* ReturnPrint: Helpers */
/*****************************************************************************/
Template.ReturnPrint.helpers({
  itemTotal: function() {
    let discount = this.discount || 0;
    return (this.quantity * this.price) * ((100 - discount)/100);
  },
  cTotal: function() {
    let subTotal = 0;
    for (i in this.items) {
      d = this.items[i].discount || 0;
      subTotal += (this.items[i].quantity * this.items[i].price) * ((100 - d) / 100);
    }
    return subTotal;
  },
  order: function() {
    return Orders.findOne(this.orderId);
  },
  shippingAddress: function() {
    let customer = Customers.findOne(this.customerId);
    if (customer) return _.findWhere(customer.addressBook, { _id: Orders.findOne(this.orderId).shippingAddressId });
  },
  billingAddress: function() {
    let customer = Customers.findOne(this.customerId);
    if (customer) return _.findWhere(customer.addressBook, { _id: Orders.findOne(this.orderId).billingAddressId });
  },
  creditLimit: function(){
    let customer =  Customers.findOne(this.customerId);
    if (customer && customer.creditLimit){
      return customer.creditLimit
    } else {
      return 0
    }
  },
  commercialAddress: function() {
    return _.findWhere(Tenants.findOne(Core.tenantId).addressBook, { isCommercial: true });
  }
});

/*****************************************************************************/
/* ReturnPrint: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnPrint.onCreated(function() {
  this.state = new ReactiveDict();
});

Template.ReturnPrint.onRendered(function() {
  setTimeout(window.print, 2000);
});

Template.ReturnPrint.onDestroyed(function() {});
