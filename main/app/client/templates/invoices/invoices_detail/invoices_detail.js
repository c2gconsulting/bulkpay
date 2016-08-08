/*****************************************************************************/
/* InvoicesDetail: Event Handlers */
/*****************************************************************************/
Template.InvoicesDetail.events({
    'click a#print-button': function(e, tmpl) {
		e.preventDefault();
		let printWindow = window.open(Router.path('invoices.print', {_id: this._id}),'width=400,height=700');
		printWindow.document.close();
		printWindow.focus();
		printWindow.print();
		//printWindow.close();
	},
    'submit form#invoice-note': function(e, tmpl) {
        e.preventDefault();
        let message = tmpl.find('input[name=txtNote]').value;
        if (message) {
            //add message
            Meteor.call('invoices/addNote', this._id, message);
            tmpl.find('form#invoice-note').reset();
        }

    },
    'click a#print-button': function(e, tmpl) {
        e.preventDefault();
        let printWindow = window.open(Router.path('invoices.print', {_id: this._id}),'width=400,height=700');
        printWindow.focus();
        //printWindow.close();
    },
});

/*****************************************************************************/
/* InvoicesDetail: Helpers */
/*****************************************************************************/
Template.InvoicesDetail.helpers({
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.orderPrice) * ((100 - discount)/100);
    },

    order: function() {
        return Orders.findOne(this.orderId);
    },
    customerGroup: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) return customer.customerGroup || '';
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
        let user = Meteor.users.findOne(this.userId);
        let userFullName = user ? user.profile.fullName : ''; 

        if (text === 'CREATE') return 'Invoice created' + (user ? ' by ' + userFullName : '');
        if (text === 'STATUS_CHANGE') return 'Invoice status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
    },
    shippingAddress: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) return _.findWhere(customer.addressBook, { _id: this.shippingAddressId });
    },
    billingAddress: function() {
        let customer = Customers.findOne(this.customerId);
        if (customer) return _.findWhere(customer.addressBook, { _id: this.billingAddressId });
    },
    openP: function() {
        if (this.discounts) return '(';
    },
    closeP: function() {
        if (this.discounts) return ')';
    },
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    documentAvailable: function(){
        return this._id ? true : false
    },
    avatar: function () {
        return UserImages.findOne({owner: this.userId})
    },
    currentUserAvatar: function(){
        return UserImages.findOne({owner: Meteor.userId()})
    }
});

/*****************************************************************************/
/* InvoicesDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.InvoicesDetail.onCreated(function () {
    this.state = new ReactiveDict();

    let self = this;
    this.autorun(function () {
        self.subscribe('ObjectsMedia', "Invoices", Template.parentData()._id);
        InvoiceSubs.subscribe('InvoiceUsers', Template.parentData()._id);
        self.subscribe('InvoiceImages', Template.parentData()._id);
    });
    self.media = function() {
        let selector;
        selector = {
            "tenantId": Core.getTenantId(),
            "objectId": Template.parentData()._id,
            "objectType": "Invoices"
        };
        return Media.find(selector);
    };
});

Template.InvoicesDetail.onRendered(function () {
});

Template.InvoicesDetail.onDestroyed(function () {
});
