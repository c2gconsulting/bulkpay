import Ladda from 'ladda';

/*****************************************************************************/
/* ReturnCreate: Event Handlers */
/*****************************************************************************/
Template.ReturnCreate.events({
    'submit form, click a#create-returnOrder': function(e, tmpl) {
        e.preventDefault();
        let returnOrderContext = Core.Schemas.ReturnOrder.namedContext("returnOrderForm");
        if (returnOrderContext.isValid()) {
            // Load button animation
            tmpl.$('#create-returnOrder').text('Saving... ');
            tmpl.$('#create-returnOrder').attr('disabled', true);
            

            try {
                let l = Ladda.create(tmpl.$('#create-returnOrder')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#create-returnOrder')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('#create-returnOrder').text('Create Return Order ');

                // Add back glyphicon
                let icon = document.createElement('span');
                icon.className = 'glyphicon icon-return';
                tmpl.$('#create-returnOrder')[0].appendChild(icon);

                tmpl.$('#create-returnOrder').removeAttr('disabled');
            }

            let doc = prepareReturnOrder(getReturnOrder());
            Meteor.call('returnorders/create', doc, function(err, result) {
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
                        text: `Return Order ${result.returnOrderNumber} has been created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK" });
                    // switch to return order detail
                    Router.go('returns.detail', {_id: result._id})
                }
                resetButton();
            });
        } else {
            swal({
                title: "Please correct errors before posting...",
                text: returnOrderContext._invalidKeys,
                confirmButtonClass: "btn-error",
                type: "error",
                confirmButtonText: "OK" });
        }

    },
    'click #cancel-returnOrder': function(e, tmpl) {
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
                text: "Your draft return order has been deleted.",  
                confirmButtonClass: "btn-info", 
                type: "info",   
                confirmButtonText: "OK" });
            Router.go('orders.detail', {_id: self._id});  
        });
    },
    'change .form-control': function(e, tmpl) {
        let field = e.currentTarget.dataset.field;
        let value = e.currentTarget.value;
        let returnOrder = getReturnOrder();
        if (field) returnOrder[field] = value;
        setReturnOrder(returnOrder);
    },
    'keyup input[name=quantity], change input[name=quantity]': function(e, tmpl) {
        let value = e.currentTarget.value;
        let returnOrder = getReturnOrder();

        value = numberize(value);
        maxValue = numberize(this.quantity);
        value = value > maxValue ? maxValue : value;
        value = value < 1 ? 1 : value;
    
        let item = _.find(returnOrder.items, { orderItemId: this._id });
        item.quantity = value;

        setReturnOrder(returnOrder);
        e.currentTarget.value = value;
        
    },
    'click a[name=reason-option]': function (e, tmpl) {
        let reason = e.currentTarget.innerText;
        let id = e.currentTarget.dataset.id;
        let code = e.currentTarget.dataset.code;
        
        let returnOrder = getReturnOrder();
        let item = _.find(returnOrder.items, { orderItemId: id });

        item.returnReason = reason;
        item.reasonCode = code;
        setReturnOrder(returnOrder);

    },
    'keypress input[name=quantity]': function(e, tmpl) {
        // prevent non-number input
        if (e.which < 48 || e.which > 57)
        {
            e.preventDefault();
        }
    },
    'click #blankCheckbox': function(e, tmpl) {
        let returnOrder = getReturnOrder();

        if (e.currentTarget.checked) {
            // filter only returnables
            let items = _.filter(this.items, function(item) {
                return item.status === 'shipped';
            });
            let returnsReasons = getReturnReasons();
            _.each(items, function(item) {
                if (!_.find(returnOrder.items, { orderItemId: item._id })) {
                    newReturnOrderItem = JSON.parse(JSON.stringify(item));
                    newReturnOrderItem.orderItemId = item._id;
                    if (returnsReasons && returnsReasons.length > 0){
                        newReturnOrderItem.returnReason = returnsReasons[0].reason;
                        newReturnOrderItem.reasonCode = returnsReasons[0].code;
                    }
                    delete newReturnOrderItem._id;
                    delete newReturnOrderItem.status;
                    returnOrder.items.push(newReturnOrderItem);
                }
            });
        } else {
            // remove all items
            returnOrder.items = [];
        }
        setReturnOrder(returnOrder);
    },
    'click .line-items': function(e, tmpl) {
        let orderItem = this;
        let returnOrder = getReturnOrder();
        
        if (e.currentTarget.checked) {
            // add item to invoice at full quantity
            let returnsReasons = getReturnReasons();
            returnOrder.items = _.reject(returnOrder.items, { orderItemId: orderItem._id }); //remove in case exists
            newReturnOrderItem = JSON.parse(JSON.stringify(orderItem));
            newReturnOrderItem.orderItemId = orderItem._id;
            if (returnsReasons && returnsReasons.length > 0){
                newReturnOrderItem.returnReason = returnsReasons[0].reason;
                newReturnOrderItem.reasonCode = returnsReasons[0].code;
            }

            delete newReturnOrderItem._id;
            delete newReturnOrderItem.status;
            returnOrder.items.push(newReturnOrderItem);

        } else {
            // remove item from invoice
            returnOrder.items = _.reject(returnOrder.items, { orderItemId: orderItem._id });
        }
        setReturnOrder(returnOrder);
        
    }
        
});

/*****************************************************************************/
/* ReturnCreate: Helpers */
/*****************************************************************************/
Template.ReturnCreate.helpers({
    shippingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.shippingAddressId });
    },
    billingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.billingAddressId });
    },
    customerGroup: function() {
        return Customers.findOne(this.customerId).customerGroup || '';
    },
    returnOrder: function() {
        return getReturnOrder();
    },
    returnItems: function() {
        if (ret = getReturnOrder()) return ret.items;
    },
    orderStandardItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'shipped' && !item.isPromo;
        });
        return items;
    },
    orderPromoItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'shipped' && item.isPromo;
        });
        return items;
    },
    orderHasNoItems: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'shipped';
        });
        return !items || items.length === 0;
    },
    returnReasons: function() {
        return getReturnReasons()
    },
    returnItem: function() {
        return _.find(getReturnOrder().items, { orderItemId: this._id });
    },
    checkAllSelected: function() {
        let items = _.filter(this.items, function(item) {
            return item.status === 'shipped';
        });
        return getReturnOrder().items.length === items.length ? 'checked' : '';
    },
    itemSelected: function() {
        return !!_.find(getReturnOrder().items, { orderItemId: this._id });
    },
    itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    returnItemTotal: function() {
        let returnItem = _.find(getReturnOrder().items, { orderItemId: this._id });
        let discount = this.discount || 0;
        return (returnItem.quantity * this.price) * ((100 - discount)/100);
    },
    cSubTotal: function() {
        let order = getReturnOrder();
        let discount = order.discounts || 0;
        let shippingCosts = numberizeD(order.shippingCosts) || 0;
        let subTotal = 0;

        _.each(order.items, function(item) {
            let d = item.discount || 0;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
            }
        });

        subTotal = Core.roundMoney((subTotal + shippingCosts - discount), order.currency.iso);
        Template.instance().state.set('cSubTotal', subTotal);
        return subTotal;
    }, /*
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
    }, */
    cTaxes: function() {
        let order = getReturnOrder();
        let discount = order.discounts || 0;
        let shippingCosts = numberizeD(order.shippingCosts) || 0;
        let taxes = 0;
        let subTotal = 0;

        _.each(order.items, function(item) {
            let d = item.discount || 0;
            let tax = item.taxRateOverride;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
                taxes += numberizeD((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
            }
        });

        let effectiveTaxRate = subTotal ? taxes / subTotal : 0;
        taxes = Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), order.currency.iso);
        Template.instance().state.set('cTaxes', taxes);
        return taxes;
    },
    cTotal: function() {
        let order = getReturnOrder();
        let subTotal = Template.instance().state.get('cSubTotal');
        let taxes = Template.instance().state.get('cTaxes');

        total = Core.roundMoney((subTotal + taxes), order.currency.iso);
        Template.instance().state.set('cTotal', total);
        return total;
    },
    disableSubmit: function() {
            let returnOrderContext = Core.Schemas.ReturnOrder.namedContext("returnOrderForm");
            if (returnOrderContext.isValid()) return '';
            return 'disabled';
    }
    
});

/*****************************************************************************/
/* ReturnCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnCreate.onCreated(function () {
    //retrieve or create new order shell
    this.state = new ReactiveDict();
    let self = this;

    // set default reasons
    initReturnOrder();

    
    //create validation context
    let returnOrderContext = Core.Schemas.ReturnOrder.namedContext("returnOrderForm");
    
    this.autorun(function() {
        self.subscribe('VariantsForOrder', Template.parentData()._id);
        
        let strippedReturnOrder = prepareReturnOrder(getReturnOrder());
        if (strippedReturnOrder) {
            returnOrderContext.validate(strippedReturnOrder);
            if (returnOrderContext.isValid()) {
                    console.log('Return Order is Valid!');
            } else {
                    console.log('Return Order is not Valid!');
            }
            console.log(returnOrderContext._invalidKeys);
        }

    });
       
});

Template.ReturnCreate.onRendered(function () {
});

Template.ReturnCreate.onDestroyed(function () {
});

function getReturnOrder() {
    let returnOrder = Session.get('draftReturnOrder');
    if (returnOrder) {
        returnOrder = JSON.parse(returnOrder);
        return returnOrder;
    } else {
        // route back to order details view
        Router.go('orders.detail', {_id: Template.instance().data._id});
        return;
    }
}

function initReturnOrder() {
    let returnOrder = Session.get('draftReturnOrder');
    if (returnOrder) {
        returnOrder = JSON.parse(returnOrder);
        let returnReasons = getReturnReasons();
        console.log(returnReasons)
        if (returnReasons && returnReasons.length > 0){
            _.forEach(returnOrder.items, function(i) {
                if (!i.returnReason) {
                    i.returnReason = returnReasons[0].reason;
                    i.reasonCode = returnReasons[0].code
                }
            });
        }
        setReturnOrder(returnOrder);
    } else {
        // route back to order details view
        Router.go('orders.detail', {_id: Template.instance().data._id});
        return
    }
}


function setReturnOrder(returnOrder) {
        Session.set('draftReturnOrder', JSON.stringify(returnOrder));
}

function prepareReturnOrder(returnOrder) {
    if (returnOrder) {
        // remove bogus items and clean up
        _.forEach(returnOrder.items, function(i) {
            delete i._id; 
            
            // numberize
            i.quantity = numberize(i.quantity);
            i.price = numberize(i.price);
            i.discount = numberize(i.discount);  
            i.taxRateOverride = numberize(i.taxRateOverride);
        
        })
        
        // record totals
        returnOrder.subTotal = numberize(Template.instance().state.get('cSubTotal'));
        returnOrder.taxes = numberize(Template.instance().state.get('cTaxes'));
        returnOrder.total = numberize(Template.instance().state.get('cTotal'));
        returnOrder.issuedAt = new Date();
    }
    return returnOrder;
}

function getReturnReasons() {
    return ReturnReasons.find({}, {sort: { sort: 1 }}).fetch()
}

function numberize(n) {
        return Math.round(_.isNaN(Number(n)) ? 0 : Number(n));  //upgrade to 2 decimals
}

function numberizeD(n) {
    return _.isNaN(Number(n)) ? 0 : Number(n);  //upgrade to 2 decimals
}