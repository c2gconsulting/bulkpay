OrdersController = ApplicationController.extend({
  
  
  // a place to put your subscriptions
  // this.subscribe('items');
  // // add the subscription to the waitlist
  // this.subscribe('item', this.params._id).wait();
  subscriptions: function() {
    ReturnReasonSubs.subscribe('ReturnReasons');
  },
  
  // Subscriptions or other things we want to "wait" on. This also
  // automatically uses the loading hook. That's the only difference between
  // this option and the subscriptions option above.
  // return Meteor.subscribe('post', this.params._id);
  
  waitOn: function () {
    return OrderSubs.subscribe('Order', this.params._id);
  },
  
  // A data function that can be used to automatically set the data context for
  // our layout. This function can also be used by hooks and plugins. For
  // example, the "dataNotFound" plugin calls this function to see if it
  // returns a null value, and if so, renders the not found template.
  // return Posts.findOne({_id: this.params._id});
  
  data: function () {
    return Orders.findOne({_id: this.params._id});
  },
  
  // You can provide any of the hook options
  
  onRun: function () {
    this.next();
  },
  onRerun: function () {
    this.next();
  },
  onBeforeAction: function () {
    this.next();
   },
  
  // The same thing as providing a function as the second parameter. You can
  // also provide a string action name here which will be looked up on a Controller
  // when the route runs. More on Controllers later. Note, the action function
  // is optional. By default a route will render its template, layout and
  // regions automatically.
  // Example:
  //  action: 'myActionFunction'
  
  detail: function () {
    let order = Orders.findOne({_id: this.params._id});
    if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId, true)){
      this.render("OrderDetail");
    } else {
      Router.go('orders.list');
    }
  },
  edit: function () {
    let order = Orders.findOne({_id: this.params._id});
    if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId )){
      this.render("OrderEdit");
    } else if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId, true)){
      //this.render("OrderDetail");
      Router.go('orders.detail', { _id: this.params._id });
    } else {
      Router.go('orders.list');
    }
  },
  print: function () {
    this.layout(null);
    let order = Orders.findOne({_id: this.params._id});
    if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId, true)){
      this.render("OrderPrint");
    } else {
      Router.go('orders.list');
    }
  },
  createReturnOrder: function(){
    if (Core.hasReturnOrderAccess(Meteor.userId())){
      this.render('ReturnCreate');
    } else {
      Router.go('returns.list');
    }
  },
  createInvoice: function(){
    let order = Orders.findOne({_id: this.params._id});
    if (order && Core.hasInvoiceAccess(Meteor.userId(), order.salesLocationId)){
      this.render('InvoiceCreate');
    } else if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId, true)){
      Router.go('orders.detail', {_id: this.params._id});
    } else {
      Router.go('invoices.list');
    }
  },
  warehouseSlip: function () {
    this.layout(null);
    let order = Orders.findOne({_id: this.params._id});
    if (order && Core.hasOrderAccess(Meteor.userId(), order.salesLocationId, true)){
      this.render("WarehouseSlip");
    } else {
      Router.go('orders.list');
    }
  },
  onAfterAction: function () {
  },
  onStop: function () {
  }
});
