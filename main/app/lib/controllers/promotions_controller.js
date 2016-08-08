PromotionsController = ApplicationController.extend({
  
// a place to put your subscriptions
  // this.subscribe('items');
  // // add the subscription to the waitlist
  // this.subscribe('item', this.params._id).wait();

  subscriptions: function() {
    //this.subscribe('Tenants');
  },

  // Subscriptions or other things we want to "wait" on. This also
  // automatically uses the loading hook. That's the only difference between
  // this option and the subscriptions option above.
  // return Meteor.subscribe('post', this.params._id);

  waitOn: function() {
    return PromotionSubs.subscribe('Promotion', this.params._id);
  },

  // A data function that can be used to automatically set the data context for
  // our layout. This function can also be used by hooks and plugins. For
  // example, the "dataNotFound" plugin calls this function to see if it
  // returns a null value, and if so, renders the not found template.
  // return Posts.findOne({_id: this.params._id});

  data: function() {
    return Promotions.findOne({
      _id: this.params._id
    });
  },

  // You can provide any of the hook options

  onRun: function() {
    this.next();
  },
  onRerun: function() {
    this.next();
  },
  onBeforeAction: function() {
    this.next();
  },

  // The same thing as providing a function as the second parameter. You can
  // also provide a string action name here which will be looked up on a Controller
  // when the route runs. More on Controllers later. Note, the action function
  // is optional. By default a route will render its template, layout and
  // regions automatically.
  // Example:
  //  action: 'myActionFunction'

  detail: function() {
    if (Core.hasPromotionAccess(Meteor.userId(), null, true)) {
      this.render("PromotionDetail");
    } else {
      Router.go('promotions.list');
    }
  },
  edit: function() {
    if (Core.hasPromotionAccess(Meteor.userId())){
      this.render("PromotionEdit");
    } else if (Core.hasPromotionAccess(Meteor.userId(), null, true)) {
      Router.go('promotions.detail', { _id: this.params._id });
    } else {
      Router.go('promotions.list');
    }
  },
  print: function() {
    this.layout(null);
    this.render("OrderPrint");
  },
  createPromotion: function() {
    if (Core.hasPromotionAccess(Meteor.userId())) {
      this.render("PromotionCreate");
    } else {
      Router.go('promotions.list');
    }
  },
  onAfterAction: function() {},
  onStop: function() {}
});
