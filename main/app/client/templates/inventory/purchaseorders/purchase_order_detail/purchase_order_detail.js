/*****************************************************************************/
/* PurchaseOrderDetail: Event Handlers */
/*****************************************************************************/
import accounting from 'accounting';
Template.PurchaseOrderDetail.events({
    'keyup input[data-ifield=receive], change input[data-type=item]': function(e, tmpl) {
        let index = e.currentTarget.dataset.index;
        let field = e.currentTarget.dataset.ifield;
        let value = e.currentTarget.value;
        let items = Template.instance().state.get('purchaseOrderItems');
        let itemId = this._id;

        let noRefresh;
        if (field === 'receive') {
            value = value.replace(/,/g, '');
            value = numberize(value);
            value = value < 0 ? 0 : value;
            tmpl.$('input#txtQty-' + index).val(accounting.formatNumber(value));
            noRefresh = true;
        }
        if (field) {
            let item = _.find(items, function(i){ return i._id === itemId; });
            if (item){
                item.receive = value;
                if ( value >= item.quantity){
                    item.allReceived = true 
                } else {
                    item.allReceived = false
                }
            }
        }
        Template.instance().state.set('purchaseOrderItems', items);

    },
    'keypress input[data-ifield=receive]': function(e, tmpl) {
        // prevent non-number input
        if (e.which < 48 || e.which > 57) {
            e.preventDefault();
        }
    },
/*
    'click #receive-button': function () {
        let purchaseOrderId = this._id;
        let items = Template.instance().state.get('purchaseOrderItems');
        Meteor.call("purchaseorders/receive", purchaseOrderId, items, function(err, succ){
            
        })
    },
*/

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
        delete clonedOrder.paymentStatus;

        // clean up order object
        delete clonedOrder.createdAt;
        delete clonedOrder.updatedAt;
        delete clonedOrder.comment;
        delete clonedOrder.notes;
        delete clonedOrder.userId;
        delete clonedOrder.orderNumber;
        delete clonedOrder.isCleared;

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

        Session.set('draftPurchaseOrder', clonedOrder);
        Router.go('purchaseOrders.create');
    },
    'click #receive-button': function(e, tmpl) {
        e.preventDefault();
        let data = generateReceivePurchaseOrder();

        let stringData = JSON.stringify(data);
        Session.set('draftReceivePurchaseOrder', stringData);
        Router.go('purchaseOrders.receive', {_id: this._id});
    },

    'submit form#order-note': function(e, tmpl) {
        e.preventDefault();
        let message = tmpl.find('input[name=txtNote]').value;
        if (message) {
            //add message
            Meteor.call('purchaseorders/addNote', this._id, message);
            tmpl.find('form#order-note').reset();
        }
    }

});

/*****************************************************************************/
/* PurchaseOrderDetail: Helpers */
/*****************************************************************************/
Template.PurchaseOrderDetail.helpers({
    shippingAddress: function() {
        let location = Locations.findOne(this.shippingAddressId);
        if (location) return location
    },
    billingAddress: function() {
        let customer = Companies.findOne(this.customerId);
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
    hasApprovalRights: function() {
        return Core.hasOrderApprovalAccess(Meteor.userId(), this.salesLocationId, String(this.orderType))
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

        if (text === 'CREATE') return 'Purchase Order created' + (user ? ' by ' + userFullName : '');
        if (text === 'STATUS_CHANGE') return 'Purchase Order status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
        if (text === 'PAYMENTSTATUS_CHANGE') return 'Purchase Order payments status changed to ' + this.newValue + (user ? ' by ' + userFullName : '');
        if (text === 'DEPOSITS_CHANGE') return 'Applied deposits to purchase order ' + this.newValue + (user ? ' by ' + userFullName : '');
        return 'Purchase Order updated by ' + userFullName
    },

    avatar: function () {
        return UserImages.findOne({owner: this.userId})
    },
    currentUserAvatar: function(){
        return UserImages.findOne({owner: Meteor.userId()})
    },
    purchaseOrderItems: function () {
        return Template.instance().state.get('purchaseOrderItems');
    },
    after: function () {
        let productVariant = ProductVariants.findOne(this.variantId);
        let locationId =  Template.parentData().shippingAddressId;
        let available = 0;
        if (productVariant){
            let location = _.find(productVariant.locations, function(location) {return location.locationId === locationId})
            if (location){
                available = location.stockOnHand
            } else {
                available = 0
            }
        }
        if (this.status === "open"){
            return available + this.quantity
        } else {
            return available
        }

    },
    allItemsReceived: function () {
        let items = this.items;
        return _.every(items, function(i) { return i.status === "received"; });
    },

    receivingAll: function () {
       let items = this.items;
        return _.every(items, function(i) { return i.allReceived === true; });
    }
});

/*****************************************************************************/
/* PurchaseOrderDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.PurchaseOrderDetail.onCreated(function () {
    let self = this;
    self.state = new ReactiveDict();


    this.autorun(function () {
        self.subscribe('VariantsForPurchaseOrder', Template.parentData()._id);
        UserSubs.subscribe('OrderUsers', Template.parentData()._id);
        CompanySubs.subscribe('Company', Template.parentData().customerId);
        self.subscribe('PurchaseOrderImages', Template.parentData()._id);
    });
});

Template.PurchaseOrderDetail.onRendered(function () {
});

Template.PurchaseOrderDetail.onDestroyed(function () {
});


function numberize(n) {
    return Math.round(_.isNaN(Number(n)) ? 0 : Number(n)); //upgrade to 2 decimals
}

function numberizeD(n) {
    return _.isNaN(Number(n)) ? 0 : Number(n); //upgrade to 2 decimals
}


function generateReceivePurchaseOrder() {
    let order = Template.instance().data;
    let items = _.filter(order.items, function(item) {
        return item.status === 'open';
    });

    for (let i in items) {
        items[i].orderItemId = items[i]._id;

        delete items[i]._id;
        delete items[i].status;
    }

    let pOrder = {
        customerId: order.customerId,
        supplierId: order.supplierId,
        customerName: order.customerName,
        supplierName: order.supplierName,
        purchaseOrderId: order._id,
        purchaseOrderNumber: order.purchaseOrderNumber,
        billingAddressId: order.billingAddressId,
        status: 'open',
        userId: Meteor.userId(),
        assigneeId: order.assigneeId,
        shippingAddressId: order.shippingAddressId,
        currency: order.currency,
        contactEmail: order.contactEmail,
        contactPhone: order.contactPhone,
        reference: order.reference,
        receivedAt: new Date,
        isPickup: order.isPickup,
        discounts: order.discounts || 0,
        taxRate: order.taxRate,
        items: items
    }
    return pOrder;

}