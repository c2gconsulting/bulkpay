HomeController = ApplicationController.extend({
  
  // a place to put your subscriptions
  // this.subscribe('items');
  // // add the subscription to the waitlist
  // this.subscribe('item', this.params._id).wait();
  
  subscriptions: function() {
    
  },
  
  // Subscriptions or other things we want to "wait" on. This also
  // automatically uses the loading hook. That's the only difference between
  // this option and the subscriptions option above.
  // return Meteor.subscribe('post', this.params._id);
  
  waitOn: function () {
    /*
    return [
      Meteor.subscribe('UserLocations'),
      Meteor.subscribe('OrderTypes'),
      Meteor.subscribe('ActivePriceLists'),
      Meteor.subscribe('CustomerGroups'),
      Meteor.subscribe('CashPaymentMethods')
    ];*/
  },
  
  // A data function that can be used to automatically set the data context for
  // our layout. This function can also be used by hooks and plugins. For
  // example, the "dataNotFound" plugin calls this function to see if it
  // returns a null value, and if so, renders the not found template.
  // return Posts.findOne({_id: this.params._id});
  
  data: function () {
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
  
  
  home: function () {
    this.render('Home');
  },
  createOrder: function () {
    if (Core.hasOrderAccess(Meteor.userId())){
      this.render('OrderCreate');
    } else {
      Router.go('home');
    }
  },
  listOrders: function () {
    this.render('OrdersList');
  },
  listReturns: function () {
    this.render('ReturnsList');
  },
  listInvoices: function () {
    this.render('InvoicesList');
  },
  listDistributors: function () {
    this.render('DistributorsList');
  },
  listPromotions: function () {
    this.render('PromotionsList');
  },
  listRebates: function () {
    this.render('RebatesList');
  },
  listPurchaseOrders: function(){
    this.render('PurchaseOrdersList');
  },
  createPurchaseOrder: function(){
    this.render('PurchaseOrderCreate');
  },
  listLocations: function () {
    this.render('LocationsList');
  },
  listSuppliers: function () {
    this.render('SuppliersList');
  },
  listTransfers: function(){
    this.render('StockTransfersList')
  },
  createTransfers: function(){
     this.render('StockTransferCreate')
  },
  listAdjustments: function(){
    this.render('StockAdjustmentsList');
  },

  onAfterAction: function () {
  },
  onStop: function () {
  }
});
