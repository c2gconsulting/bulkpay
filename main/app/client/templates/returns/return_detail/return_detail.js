/*****************************************************************************/
/* ReturnDetail: Event Handlers */
/*****************************************************************************/
Template.ReturnDetail.events({
  'click a#print-button': function(e, tmpl) {
    let printWindow = window.open(Router.path('returns.print', {_id: this._id}),'width=400,height=700');
    printWindow.focus();
  },
  'submit form#return-note': function(e, tmpl) {
    e.preventDefault();
    let message = tmpl.find('input[name=txtNote]').value;
    if (message) {
      //add message
      Meteor.call('returnorders/addNote', this._id, message);
      tmpl.find('form#return-note').reset();
    }
  },
  'click #approveReturnOrder': function(e){
    e.preventDefault();
    Meteor.call('returnorders/updateStatus', Meteor.userId(), this._id, "approved", function(err, result) {
      if (err) {
        swal("Oops!", err.reason, "error");
      } else {
        swal("Success!", 'Return Order has been approved', "success");
      }
    });
  },
  'click #approve': function(e) {
    e.preventDefault();
    Session.set('objectType', 'ReturnOrders');
    Session.set('objectId', this._id);
    Modal.show('ReturnApprovalModal');
  },
  'click #attachments': function(e) {
    e.preventDefault();
    Session.set('objectType', 'ReturnOrders');
    Session.set('objectId', this._id);
    Modal.show('AttachmentModal');
  }
});

/*****************************************************************************/
/* ReturnDetail: Helpers */
/*****************************************************************************/
Template.ReturnDetail.helpers({
  order: function() {
    return Orders.findOne(this.orderId);
  },
  customerGroup: function() {
    let customer = Customers.findOne(this.customerId);
    if (customer) return customer.customerGroup || '';
  },
  shippingAddress: function() {
    let customer = Customers.findOne(this.customerId);
    if (customer) return _.findWhere(customer.addressBook, { _id: Orders.findOne(this.orderId).shippingAddressId });
  },
  billingAddress: function() {
    let customer = Customers.findOne(this.customerId);
    if (customer) return _.findWhere(customer.addressBook, { _id: Orders.findOne(this.orderId).billingAddressId });
  },
  documentAvailable: function(){
    return this._id ? true : false
  },
  textFormat: function(text){
    let user = Meteor.users.findOne(this.userId);
    let userFullName = user ? user.profile.fullName : '';

    if (text === 'CREATE') return 'Return order created' + (user ? ' by ' + userFullName : '');
    if (text === 'STATUS_CHANGE') return 'Return order status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
    if (text === 'AUTO_APPROVAL') return 'Return order auto-approved';
  },
  hasApprovalRights: function() {
    if (this.salesLocationId && Core.hasReturnApprovalAccess(Meteor.userId(), this.salesLocationId)){
      return true
    } else {
      return false
    }
  },
  assets: function(){
    return Template.instance().media();
  },
  avatar: function () {
    return UserImages.findOne({owner: this.userId})
  },
  currentUserAvatar: function(){
    return UserImages.findOne({owner: Meteor.userId()})
  },
  canManageReturns: function () {
    return Core.hasReturnOrderAccess(Meteor.userId(), this.salesLocationId)
  },
  returnStandardItems: function() {
    return _.filter(this.items, function(item) {
            return !item.isPromo;
        });
  },
  returnPromoItems: function() {
    return _.filter(this.items, function(item) {
            return item.isPromo;
        });
  }
});

/*****************************************************************************/
/* ReturnDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnDetail.onCreated(function() {
  this.state = new ReactiveDict();
  let self = this;
  this.autorun(function () {
    self.subscribe('ObjectsMedia', "ReturnOrders", Template.parentData()._id);
    UserSubs.subscribe('ReturnOrderUsers', Template.parentData()._id);
    self.subscribe('ReturnOrderImages', Template.parentData()._id);
  });
  
  self.media = function() {
    let selector;
    selector = {
      "tenantId": Core.getTenantId(),
      "objectId": Template.parentData()._id,
      "objectType": "ReturnOrders"
    };
    return Media.find(selector);
  };

  
});

Template.ReturnDetail.onRendered(function() {});

Template.ReturnDetail.onDestroyed(function() {});
