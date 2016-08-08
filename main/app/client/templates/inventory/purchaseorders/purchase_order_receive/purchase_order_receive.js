/*****************************************************************************/
/* PurchaseOrderReceive: Event Handlers */
/*****************************************************************************/
import accounting from 'accounting';
import Ladda from 'ladda';
Template.PurchaseOrderReceive.events({
    'submit form, click a#receive-button': function(e, tmpl) {
        e.preventDefault();
        let self = this
        let invoiceContext = Core.Schemas.Invoice.namedContext("invoiceForm");
        if (invoiceContext.isValid()) {
            // Load button animation
            tmpl.$('#receive-button').text('Saving... ');
            tmpl.$('#receive-button').attr('disabled', true);


            try {
                let l = Ladda.create(tmpl.$('#receive-button')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#receive-button')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('#receive-button').text('Receive items ');

                // Add back glyphicon
                let icon = document.createElement('span');
                icon.className = 'glyphicon icon-lilist';
                tmpl.$('#receive-button')[0].appendChild(icon);

                tmpl.$('#receive-button').removeAttr('disabled');
            }

            let doc = preparePurchaseOrder(getPurchaseOrder());
            Meteor.call('purchaseorders/receive', doc, function(err, result) {
                if (err) {
                    swal({
                        title: "Oops!",
                        text: err.reason,
                        confirmButtonClass: "btn-error",
                        type: "error",
                        confirmButtonText: "OK" });
                } else {
                    swal({
                        title: "Success",
                        text: "The selected items have been received",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK" });
                    // switch to return order detail
                    Router.go('purchaseOrders.detail', {_id: self._id})
                }
                resetButton();
            });
        } else {
            swal({
                title: "Please correct errors before posting...",
                text: invoiceContext._invalidKeys,
                confirmButtonClass: "btn-error",
                type: "error",
                confirmButtonText: "OK" });
        }

    },
    'click [name=btnAddShipping]': function(e, tmpl) {
        e.preventDefault()
        let purchaseOrder = getPurchaseOrder();
        purchaseOrder.showShipping = true;
        setPurchaseOrder(purchaseOrder);
    },
    'click #cancel-button': function(e, tmpl) {
        e.preventDefault();
        let self = this;
        swal({
                title: "Are you sure?",
                text: "You will lose your entries!",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Cancel",
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, exit!",
                closeOnConfirm: false
            },
            function(){
                swal({
                    title: "Cancelled",
                    text: "Your draft goods received has been deleted.",
                    confirmButtonClass: "btn-info",
                    type: "info",
                    confirmButtonText: "OK" });
                Router.go('purchaseOrders.detail', {_id: self._id});
            });
    },
    'change .form-control': function(e, tmpl) {
        let field = e.currentTarget.dataset.field;
        let value = e.currentTarget.value;
        let purchaseOrder = getPurchaseOrder();
        if (field) purchaseOrder[field] = value;
        setPurchaseOrder(purchaseOrder);
    },
    'keyup input[name=quantity], change input[name=quantity]': function(e, tmpl) {
        let value = e.currentTarget.value;
        let purchaseOrder = getPurchaseOrder();

        value = numberize(value);
        maxValue = numberize(this.quantity);
        value = value > maxValue ? maxValue : value;
        value = value < 1 ? 1 : value;

        let item = _.find(purchaseOrder.items, { orderItemId: this._id });
        item.quantity = value;

        setPurchaseOrder(purchaseOrder);
        e.currentTarget.value = value;

    },
    'keypress input[name=quantity]': function(e, tmpl) {
        // prevent non-number input
        if (e.which < 48 || e.which > 57)
        {
            e.preventDefault();
        }
    },
    'click #blankCheckbox': function(e, tmpl) {
        let purchaseOrder = getPurchaseOrder();

        if (e.currentTarget.checked) {
            // add any omitted items
            _.each(this.items, function(item) {
                if (!_.find(invoice.items, { orderItemId: item._id })) {
                    newPurchaseOrderItem = JSON.parse(JSON.stringify(item));
                    newPurchaseOrderItem.orderItemId = item._id;

                    delete newPurchaseOrderItem._id;
                    delete newPurchaseOrderItem.status;
                    purchaseOrder.items.push(newPurchaseOrderItem);
                }
            });
        } else {
            // remove all items
            purchaseOrder.items = [];
        }
        setPurchaseOrder(purchaseOrder);
    },
    'click .line-items': function(e, tmpl) {
        let orderItem = this;
        let purchaseOrder = getPurchaseOrder();

        if (e.currentTarget.checked) {
            // add item to invoice at full quantity
            purchaseOrder.items = _.reject(purchaseOrder.items, { orderItemId: orderItem._id }); //remove in case exists
            newPurchaseOrderItem = JSON.parse(JSON.stringify(orderItem));
            newPurchaseOrderItem.orderItemId = orderItem._id;

            delete newPurchaseOrderItem._id;
            delete newPurchaseOrderItem.status;
            purchaseOrder.items.push(newPurchaseOrderItem);

        } else {
            // remove item from invoice
            purchaseOrder.items = _.reject(purchaseOrder.items, { orderItemId: orderItem._id });
        }
        setPurchaseOrder(purchaseOrder);

    },
    'keypress input.input-landing-cost': function(e, tmpl) {
        // prevent non-number input
        if ((e.which < 48 || e.which > 57) && e.which !== 46)
        {
            e.preventDefault();
        }
    },
    'keyup input.input-landing-cost, change input.input-landing-cost': function(e, tmpl) {
        // get amount
        let purchaseOrder = getPurchaseOrder();
        let amount = e.currentTarget.value;
        if (amount) amount = amount.replace(/,/g,'');

        let field = e.currentTarget.dataset.ref;
        if (field) purchaseOrder[field] = amount;
        setPurchaseOrder(purchaseOrder, true);

    }
});

/*****************************************************************************/
/* PurchaseOrderReceive: Helpers */
/*****************************************************************************/
Template.PurchaseOrderReceive.helpers({
    shippingAddress: function() {
        let location = Locations.findOne(this.shippingAddressId);
        if (location) return location
    },

    after: function () {
        let productVariant = ProductVariants.findOne(this.variantId);
        let locationId =  Template.parentData().shippingAddressId;
        let purchaseOrder = getPurchaseOrder();
        let item = _.find(purchaseOrder.items, { orderItemId: this._id });
        let available = 0;
        if (productVariant){
            let location = _.find(productVariant.locations, function(location) {return location.locationId === locationId})
            if (location){
                available = location.stockOnHand
            } else {
                available = 0
            }
        }
        if (item && this.status === "open"){
            return available + item.quantity
        } else {
            return available
        }

    },
    billingAddress: function() {
        let customer = Companies.findOne(this.customerId);
        if (customer) return _.findWhere(customer.addressBook, { _id: this.billingAddressId });
    },
    purchaseOrder: function() {
        return getPurchaseOrder();
    },
    purchaseOrderItems: function() {
        if (po = getPurchaseOrder()) return po.items;
    },
    openItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'open';
        });
        return _.filter(items, function(el) { return !el.isPromo; });
    },
    orderPromoItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'open';
        });
        return _.filter(items, function(el) { return el.isPromo; });
    },
    purchaseOrderHasNoItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'open';
        });
        return !items || items.length === 0;
    },
    purchaseOrderItem: function() {
        return _.find(getPurchaseOrder().items, { orderItemId: this._id });
    },
    checkAllSelected: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'open';
        });
        return getPurchaseOrder().items.length === items.length ? 'checked' : '';
    },
    openP: function() {
        if (getPurchaseOrder().discounts) return '(';
    },
    closeP: function() {
        if (getPurchaseOrder().discounts) return ')';
    },
    itemSelected: function() {
        return !!_.find(getPurchaseOrder().items, { orderItemId: this._id });
    },
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    purchaseOrderItemTotal: function() {
        let purchaseOrderItem = _.find(getPurchaseOrder().items, { orderItemId: this._id });
        let discount = this.discount || 0;
        return (purchaseOrderItem.quantity * this.price) * ((100 - discount)/100);
    },
    cSubTotal: function() {
        let purchaseOrder = getPurchaseOrder();
        let discount = purchaseOrder.discounts || 0;
        let shippingCosts = numberizeD(purchaseOrder.shippingCosts) || 0;
        let subTotal = 0;

        _.each(purchaseOrder.items, function(item) {
            let d = item.discount || 0;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
            }
        });

        subTotal = Core.roundMoney((subTotal + shippingCosts - discount), purchaseOrder.currency.iso);
        Template.instance().state.set('cSubTotal', subTotal);
        return subTotal;
    },
    cTaxes: function() {
        let purchaseOrder = getPurchaseOrder();
        let discount = purchaseOrder.discounts || 0;
        let shippingCosts = numberizeD(purchaseOrder.shippingCosts) || 0;
        let taxes = 0;
        let subTotal = 0;

        _.each(purchaseOrder.items, function(item) {
            let d = item.discount || 0;
            let tax = item.taxRateOverride;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
                taxes += numberizeD((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
            }
        });

        let effectiveTaxRate = subTotal ? taxes / subTotal : 0;
        taxes = Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), purchaseOrder.currency.iso);
        Template.instance().state.set('cTaxes', taxes);
        return taxes;
    },
    cTotal: function() {
        let purchaseOrder = getPurchaseOrder();
        let subTotal = Template.instance().state.get('cSubTotal');
        let taxes = Template.instance().state.get('cTaxes');

        total = Core.roundMoney((subTotal + taxes), purchaseOrder.currency.iso);
        Template.instance().state.set('cTotal', total);
        return total;
    },
    disableSubmit: function() {
        let purchaseOrderContext = Core.Schemas.GoodsReceivedNote.namedContext("purchaseOrderForm");
        if (purchaseOrderContext.isValid()) return '';
        return 'disabled';
    },
    showShipping: function() {
        let purchaseOrder = getPurchaseOrder();
        return purchaseOrder.showShipping || purchaseOrder.shippingCosts > 0;
    }
});

/*****************************************************************************/
/* PurchaseOrderReceive: Lifecycle Hooks */
/*****************************************************************************/
Template.PurchaseOrderReceive.onCreated(function () {
    //retrieve or create new order shell
    this.state = new ReactiveDict();
    let self = this;

    // Set purchaseOrder to initialise local computed values like discounts
    setPurchaseOrder(getPurchaseOrder());

    //create validation context
    let purchaseOrderContext = Core.Schemas.GoodsReceivedNote.namedContext("purchaseOrderForm");

    this.autorun(function() {
        self.subscribe('VariantsForPurchaseOrder', Template.parentData()._id);
        CompanySubs.subscribe('Company', Template.parentData().customerId);

        let strippedPurchaseOrder = preparePurchaseOrder(getPurchaseOrder());
        if (strippedPurchaseOrder) {
            purchaseOrderContext.validate(strippedPurchaseOrder);
            if (purchaseOrderContext.isValid()) {
                console.log('purchaseOrder is Valid!');
            } else {
                console.log('purchaseOrder is not Valid!');
            }
            console.log(purchaseOrderContext._invalidKeys);
        }

    });
});

Template.PurchaseOrderReceive.onRendered(function () {
});

Template.PurchaseOrderReceive.onDestroyed(function () {
});



function setPurchaseOrder(purchaseOrder) {
    let order = PurchaseOrders.findOne(Template.parentData()._id);
    purchaseOrder.discounts = order && order.discounts ? (Core.getDocumentRawTotal(purchaseOrder.items) / order.rawTotal()) * order.discounts : 0;
    Session.set('draftReceivePurchaseOrder', JSON.stringify(purchaseOrder));
}

function getPurchaseOrder() {
    let purchaseOrder = Session.get('draftReceivePurchaseOrder');
    if (purchaseOrder) {
        return JSON.parse(purchaseOrder);
    } else {
        // route back to order details view
        Router.go('purchaseOrders.detail', { _id: Template.parentData()._id });
        return;
    }
}

function preparePurchaseOrder(purchaseOrder) {
    if (purchaseOrder) {
        // remove bogus items and clean up
        _.forEach(purchaseOrder.items, function(i) {

            // numberize
            i.quantity = numberize(i.quantity);
            i.price = numberize(i.price);
            i.discount = numberize(i.discount);
            i.taxRateOverride = numberize(i.taxRateOverride);

        });

        // record totals
        purchaseOrder.subTotal = numberize(Template.instance().state.get('cSubTotal'));
        purchaseOrder.taxes = numberize(Template.instance().state.get('cTaxes'));
        purchaseOrder.total = numberize(Template.instance().state.get('cTotal'));
        purchaseOrder.receivedAt = new Date;

        delete purchaseOrder.showShipping;
    }
    return purchaseOrder;
}

function numberize(n) {
    return Math.round(_.isNaN(Number(n)) ? 0 : Number(n));  //upgrade to 2 decimals
}

function numberizeD(n) {
    return _.isNaN(Number(n)) ? 0 : Number(n);  //upgrade to 2 decimals
}