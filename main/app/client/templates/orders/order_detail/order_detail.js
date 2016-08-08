import accounting from 'accounting';

/*****************************************************************************/
/* OrderDetail: Event Handlers */
/*****************************************************************************/
Template.OrderDetail.events({
	'click a#print-button': function(e, tmpl) {
		e.preventDefault();
		let printWindow = window.open(Router.path('orders.print', {_id: this._id}),'width=400,height=700');
		printWindow.focus();
		//printWindow.close();
	},
	'click a#warehouseSlip-button': function(e, tmpl) {
		e.preventDefault();
		let printWindow = window.open(Router.path('orders.warehouseSlip', {_id: this._id}),'width=400,height=700');
		printWindow.focus();
	},
	'submit form#order-note': function(e, tmpl) {
		e.preventDefault();
		let message = tmpl.find('input[name=txtNote]').value;
		if (message) {
			//add message
			Meteor.call('orders/addNote', this._id, message);
			tmpl.find('form#order-note').reset();
		}			
	},

	'click #approve': function(e) {
		e.preventDefault();
		Session.set('objectId', this._id);
		Session.set('objectType', 'Orders');
		Modal.show('approvalModal');
	},

	'click #attachments': function(e) {
		e.preventDefault();
		Session.set('objectType', 'Orders');
		Session.set('objectId', this._id);
		Modal.show('AttachmentModal');
	},


	'click a#clone-button': function(e, tmpl) {
		e.preventDefault();
		
		//prepare order
		let clonedOrder = this;
		let i = 0;
		
		// remove promo items (double approach to handle any issues)
		if (clonedOrder.hasPromotions && clonedOrder.rawOrder) clonedOrder = JSON.parse(clonedOrder.rawOrder);
		//clonedOrder.items = _.filter(clonedOrder.items, function(item) { return !item.isPromo });
		
		for (i in clonedOrder.items) { 
			if (clonedOrder.items[i].status !== 'deleted') {
				clonedOrder.items[i].bogusVariant = ProductVariants.findOne(clonedOrder.items[i].variantId);
				if (clonedOrder.items[i].bogusVariant) {
					clonedOrder.items[i].bogusVariant.available = clonedOrder.items[i].bogusVariant.locations ? clonedOrder.items[i].bogusVariant.locations[0].stockOnHand : 0; 
					clonedOrder.items[i].status = 'open';
					clonedOrder.items[i].index = i;
				} else {
					clonedOrder.items.splice(i, 1);
				}
			} else {
				clonedOrder.items.splice(i, 1);
			}
		}
		
		clonedOrder.issuedAt = new Date;
		clonedOrder.shipAt = new Date;
		clonedOrder.cashPayment = 0;
		clonedOrder.isInConfirmation = false;
		clonedOrder.clonedFrom = clonedOrder.orderNumber;
		
		//reset all statuses
		delete clonedOrder.status;
		delete clonedOrder.shippingStatus;
		delete clonedOrder.paymentStatus;
		delete clonedOrder.shippingStatus;
		delete clonedOrder.approvalStatus;
		
		// clean up order object
		delete clonedOrder.createdAt;
		delete clonedOrder.updatedAt;
		delete clonedOrder.comment;
		delete clonedOrder.notes;
		delete clonedOrder.userId;
		delete clonedOrder.orderNumber;
		delete clonedOrder.isCleared;
		delete clonedOrder.isApproved;
		
		delete clonedOrder.appliedCredits;
		delete clonedOrder.payments;
		delete clonedOrder.nonCashPayments;
		delete clonedOrder.cashPayments;
		delete clonedOrder.history;
		delete clonedOrder.subTotal;
		delete clonedOrder.taxes;
		delete clonedOrder.total;
		delete clonedOrder.createdBy;
		//delete clonedOrder.discounts;
		//delete clonedOrder.shippingCosts;
		
		delete clonedOrder._id;
		delete clonedOrder._groupId;
		delete clonedOrder.approvals;
		
		Session.set('draftOrder', clonedOrder);
		Router.go('orders.create');
	},
	'click [name=cancelOrder]': function(e, tmpl) {
		let self = this;
		swal({
					title: "Are you sure?",
					text: "This action cannot be reversed!",
					type: "warning",
					showCancelButton: true,
					cancelButtonText: "No, go back",
					confirmButtonClass: "btn-danger",
					confirmButtonText: "Yes, cancel it!",
					closeOnConfirm: false,   
					showLoaderOnConfirm: true
			},
			function(){
					Meteor.call('orders/updateStatus', self._id, 'cancelled', function(err, result) {
						if (err) {
							// give error message
						swal({   
									title: "Oops!",   
									text: err.reason,  
									confirmButtonClass: "btn-error", 
									type: "error",   
									confirmButtonText: "OK" });
						} else {
							 swal({   
									title: "Cancelled",   
									text: `Order ${self.orderNumber} has been cancelled`,  
									confirmButtonClass: "btn-success", 
									type: "success",   
									confirmButtonText: "OK" });
							//Router.go('orders.list');  
						}
					});
			});
	},
	'click [name=removeHolds]': function () {
		let self = this;
		let parent = Template.parentData([1]);
		swal({
				title: "Are you sure?",
				text: "This action cannot be reversed!",
				type: "warning",
				showCancelButton: true,
				cancelButtonText: "No, go back",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "Yes, remove it!",
				closeOnConfirm: true,
				showLoaderOnConfirm: true
			},
			function(){
				Meteor.call('orders/removeHolds', self._id, function(err, result) {
					if (err) {
						// give error message
						swal({
							title: "Oops!",
							text: err.reason,
							confirmButtonClass: "btn-error",
							type: "error",
							confirmButtonText: "OK" });
					} else {
						// show update on bottom right corner
						/* swal({
						 title: "Remove Hods",   
						 text: "All holds for this order has been removed",
						 confirmButtonClass: "btn-success", 
						 type: "success",   
						 confirmButtonText: "OK" });*/
					}
				});
			});
		
	},
	'click [name=removeItem]': function(e, tmpl) {
		/*
		let self = this;
		let parent = Template.parentData([1]);
		swal({
					title: "Are you sure?",
					text: "This action cannot be reversed!",
					type: "warning",
					showCancelButton: true,
					cancelButtonText: "No, go back",
					confirmButtonClass: "btn-danger",
					confirmButtonText: "Yes, remove it!",
					closeOnConfirm: true,   
					showLoaderOnConfirm: true
			},
			function(){
				Meteor.call('orders/updateItemStatus', parent._id, self._id, 'deleted', function(err, result) {
					if (err) {
						// give error message
						swal({   
							title: "Oops!",   
							text: err.reason,  
							confirmButtonClass: "btn-error", 
							type: "error",   
							confirmButtonText: "OK" });
					} else {
						 // show update on bottom right corner
						 
						//Router.go('orders.list');  
					}
				});
			});*/
	},
	
	'click #returns-button': function(e, tmpl) {
		e.preventDefault();
		let data = generateReturnOrder();
		
		let stringData = JSON.stringify(data);
		Session.set('draftReturnOrder', stringData);
		Router.go('returns.create', {_id: this._id});
	},
	'click #invoice-button': function(e, tmpl) {
		e.preventDefault();
		let data = generateInvoice();
		
		let stringData = JSON.stringify(data);
		Session.set('draftInvoice', stringData);
		Router.go('invoices.create', {_id: this._id});
	}
});

/*****************************************************************************/
/* OrderDetail: Helpers */
/*****************************************************************************/
Template.OrderDetail.helpers({
	shippingAddress: function() {
		let customer = Customers.findOne(this.customerId);
		if (customer) return _.findWhere(customer.addressBook, { _id: this.shippingAddressId });
	},
	billingAddress: function() {
		let customer = Customers.findOne(this.customerId);
		if (customer) return _.findWhere(customer.addressBook, { _id: this.billingAddressId });
	},
	customerGroup: function() {
		let customer = Customers.findOne(this.customerId);
		if (customer) return customer.customerGroup || '';
	},
	standardItems: function() {
		return _.filter(this.items, function(el) { return !el.isPromo; });
	},
	promoItems: function() {
		return _.filter(this.items, function(el) { return el.isPromo; });
	},
	itemTotal: function() {
		let discount = this.discount || 0;
		return (this.quantity * this.price) * ((100 - discount)/100);
	},
	hasInvoices: function() {
		return !!Invoices.findOne({orderId: this._id});
	},
    hasApprovalRights: function() {
		return Core.hasOrderApprovalAccess(Meteor.userId(), this.salesLocationId, String(this.orderType))
	},
	invoices: function() {
		return Invoices.find({orderId: this._id});
	},
	hasReturns: function() {
		return !!ReturnOrders.findOne({orderId: this._id});
	},
	returnOrders: function() {
		return ReturnOrders.find({orderId: this._id});
	},
	canBeInvoiced: function() {
		return this.status !== 'cancelled' && this.status !== 'open' && this.openItemCount() > 0;
	},
	canBeReturned: function() {
		return this.status === 'shipped' && this.shippedItemCount() > 0;
	},
	cSubTotal: function() {
		discount = this.discounts || 0;
		let subTotal = 0;
		for (i in this.items) {
			d = this.items[i].discount || 0;
			if (!this.items[i].isPromo && this.items[i].status !== 'deleted') subTotal += (this.items[i].quantity * this.items[i].price) * ((100 - d)/100);
		}
		let ans = subTotal - discount;
		Template.instance().state.set('cSubTotal', ans);
		return ans;
	},
	cTaxes: function() {
		let cSubTotal = Template.instance().state.get('cSubTotal');
		let ans = (this.taxRate/100) * cSubTotal;
		Template.instance().state.set('cTaxes', ans);
		return ans;
	},
	cTotal: function() {
		let cTaxes = Template.instance().state.get('cTaxes');
		let cSubTotal = Template.instance().state.get('cSubTotal');
		let ans = cTaxes + cSubTotal;
		return ans;
	},
	openP: function() {
        if (this.discounts) return '(';
    },
    closeP: function() {
        if (this.discounts) return ')';
    },
	orderNotes: function() {
		return  _.sortBy(this.notes, function(note) { return -note.createdAt; })
	},
	cancelledWatermark: function() {
		//return this.status === 'cancelled' ? 'overlay' : '';
	},
	documentAvailable: function(){
		return this._id ? true : false
	},
	textFormat: function(text){
		let user = Meteor.users.findOne(this.userId);
		let userFullName = user ? user.profile.fullName : '';

		if (text === 'CREATE') return 'Order created' + (user ? ' by ' + userFullName : '');
		if (text === 'AUTO_APPROVAL') return 'Order auto-approved';
		if (text === 'STATUS_CHANGE') return 'Order status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
		if (text === 'PAYMENTSTATUS_CHANGE') return 'Order payments status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
		if (text === 'APPROVALSTATUS_CHANGE') return 'Order ' + this.newValue + (user ? ' by ' + userFullName : '');
		if (text === 'CREDITS_CHANGE') return 'Applied credits to order ' + this.newValue + (user ? ' by ' + userFullName : '');
		if (text === 'REBATES_CHANGE') return 'Applied rebates to order ' + this.newValue + (user ? ' by ' + userFullName : '');
		if (text === 'DEPOSITS_CHANGE') return 'Applied deposits to order ' + this.newValue + (user ? ' by ' + userFullName : '');
		return 'Order updated by ' + userFullName
	},

	canApproveOrReject: function () {
		let order = Template.parentData();
		if (order.approvalStatus === "pending") {
			return true
		}
	},
	assets: function(){
		return Template.instance().media();
	},
	creditCleared: function() {
		return this.isCleared && this.paymentStatus !== 'paid';
	},
	avatar: function () {
		return UserImages.findOne({owner: this.userId})
	},
	currentUserAvatar: function(){
		return UserImages.findOne({owner: Meteor.userId()})
	},
	canManageOrder: function () {
		return Core.hasOrderAccess(Meteor.userId(), this.salesLocationId)
	},
	canManageAnyOrder: function () {
		return Core.hasOrderAccess(Meteor.userId());
	},
	canManageInvoices: function () {
		return Core.hasInvoiceAccess(Meteor.userId(), this.salesLocationId)
	},
	canManageReturns: function () {
		return Core.hasReturnOrderAccess(Meteor.userId(), this.salesLocationId)
	},
	canRemoveHolds: function () {
		return Core.hasAdminAccess(Meteor.userId())
	},
	hasHolds: function () {
		let creditHolds = CreditHolds.find({orderNumber: this.orderNumber}).fetch();
		let customerHolds = CustomerHolds.find({orderNumber: this.orderNumber}).fetch();
		if ((_.isArray(creditHolds) && creditHolds.length > 0) || (_.isArray(customerHolds) && customerHolds.length > 0) ){
			return true
		} else {
			return false
		}
	}
});

/*****************************************************************************/
/* OrderDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.OrderDetail.onCreated(function () {
	this.state = new ReactiveDict();

	let self = this;
	this.autorun(function () {
		self.subscribe('ObjectsMedia', "Orders", Template.parentData()._id);
		self.subscribe('VariantsForOrder', Template.parentData()._id);
		self.subscribe('OrderHolds', Template.parentData().orderNumber);
		UserSubs.subscribe('OrderUsers', Template.parentData()._id);
		self.subscribe('OrderImages', Template.parentData()._id);
	});
	self.media = function() {
		let selector;
		selector = {
			"tenantId": Core.getTenantId(),
			"objectId": Template.parentData()._id,
			"objectType": "Orders"
		};
		return Media.find(selector);
	};
});

Template.OrderDetail.onRendered(function () {
});

Template.OrderDetail.onDestroyed(function () {
});

function generateReturnOrder() {
	let order = Template.instance().data;
	let items = _.filter(order.items, function(item) {
		return item.status === 'shipped';
	});

	for (let i in items) {
		items[i].orderItemId = items[i]._id;
		
		delete items[i]._id;
		delete items[i].status;
	}

	let returnOrder = {
		customerId: order.customerId,
        customerName: order.customerName,
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'pending',
        userId: Meteor.userId(),
        assigneeId: order.assigneeId,
        stockLocationId: order.stockLocationId,
        currency: order.currency,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        reference: order.reference,
        issuedAt: new Date,
        isPickup: order.isPickup,
        discounts: order.discounts || 0,
        taxRate: order.taxRate,
        items: items
	}
	return returnOrder;
	
}

function generateInvoice() {
	let order = Template.instance().data;
	let items = _.filter(order.items, function(item) {
		return item.status === 'open';
	});

	for (let i in items) {
		items[i].orderItemId = items[i]._id;
		
		delete items[i]._id;
		delete items[i].status;
	}

	let invoice = {
		customerId: order.customerId,
        customerName: order.customerName,
        orderId: order._id,
        orderNumber: order.orderNumber,
        userId: Meteor.userId(),
        stockLocationId: order.stockLocationId,
        currency: order.currency,
        reference: order.reference,
        issuedAt: new Date(),
        invoicedAt: new Date(),
        shipAt: new Date(),
        //discounts: order.discounts || 0,
        taxRate: order.taxRate,
        items: items
	}
	return invoice;
	
}

function numberizeD(n) {
    return _.isNaN(Number(n)) ? 0 : Number(n); //upgrade to 2 decimals
}