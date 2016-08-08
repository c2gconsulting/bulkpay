import Ladda from 'ladda';

/*****************************************************************************/
/* InvoiceCreate: Event Handlers */
/*****************************************************************************/
Template.InvoiceCreate.events({
    'submit form, click a#create-invoice': function(e, tmpl) {
        e.preventDefault();
        let invoiceContext = Core.Schemas.Invoice.namedContext("invoiceForm");
        if (invoiceContext.isValid()) {
            // Load button animation
            tmpl.$('#create-invoice').text('Saving... ');
            tmpl.$('#create-invoice').attr('disabled', true);
            

            try {
                let l = Ladda.create(tmpl.$('#create-invoice')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }


            let resetButton = function() {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#create-invoice')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('#create-invoice').text('Post Invoice ');

                // Add back glyphicon
                let icon = document.createElement('span');
                icon.className = 'glyphicon icon-lilist';
                tmpl.$('#create-invoice')[0].appendChild(icon);

                tmpl.$('#create-invoice').removeAttr('disabled');
            }

            let doc = prepareInvoice(getInvoice());
            Meteor.call('invoices/create', doc, function(err, result) {
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
                        text: `Invoice ${result.invoiceNumber} has been created`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK" });
                    // switch to return order detail
                    Router.go('invoices.detail', {_id: result._id})
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
    'click #cancel-invoice': function(e, tmpl) {
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
                text: "Your draft invoice has been deleted.",  
                confirmButtonClass: "btn-info", 
                type: "info",   
                confirmButtonText: "OK" });
            Router.go('orders.detail', {_id: self._id});  
        });
    },
    'change .form-control': function(e, tmpl) {
        let field = e.currentTarget.dataset.field;
        let value = e.currentTarget.value;
        let invoice = getInvoice();
        if (field) invoice[field] = value;
        setInvoice(invoice);
    },
    'keyup input[name=quantity], change input[name=quantity]': function(e, tmpl) {
        let value = e.currentTarget.value;
        let invoice = getInvoice();

        value = numberize(value);
        maxValue = numberize(this.quantity);
        value = value > maxValue ? maxValue : value;
        value = value < 1 ? 1 : value;
    
        let item = _.find(invoice.items, { orderItemId: this._id });
        item.quantity = value;
        
        setInvoice(invoice);
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
    	let invoice = getInvoice();

    	if (e.currentTarget.checked) {
    		// add any omitted items
    		_.each(this.items, function(item) {
    			if (!_.find(invoice.items, { orderItemId: item._id })) {
    				newInvoiceItem = JSON.parse(JSON.stringify(item));
					newInvoiceItem.orderItemId = item._id;

					delete newInvoiceItem._id;
					delete newInvoiceItem.status;
					invoice.items.push(newInvoiceItem);
    			}
    		});
    	} else {
    		// remove all items
    		invoice.items = [];
    	}
    	setInvoice(invoice);
    },
    'click .line-items': function(e, tmpl) {
		let orderItem = this;
		let invoice = getInvoice();
		
		if (e.currentTarget.checked) {
			// add item to invoice at full quantity
			invoice.items = _.reject(invoice.items, { orderItemId: orderItem._id }); //remove in case exists
			newInvoiceItem = JSON.parse(JSON.stringify(orderItem));
			newInvoiceItem.orderItemId = orderItem._id;

			delete newInvoiceItem._id;
			delete newInvoiceItem.status;
			invoice.items.push(newInvoiceItem);

		} else {
			// remove item from invoice
			invoice.items = _.reject(invoice.items, { orderItemId: orderItem._id });
		}
		setInvoice(invoice);
		
	}
	
        
});

/*****************************************************************************/
/* InvoiceCreate: Helpers */
/*****************************************************************************/
Template.InvoiceCreate.helpers({
    shippingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.shippingAddressId });
    },
    billingAddress: function() {
        return _.findWhere(Customers.findOne(this.customerId).addressBook, { _id: this.billingAddressId });
    },
    customerGroup: function() {
		return Customers.findOne(this.customerId).customerGroup || '';
	},
	invoice: function() {
        return getInvoice();
    },
    invoiceItems: function() {
        if (inv = getInvoice()) return inv.items;
    },
    orderStandardItems: function() {
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
	orderHasNoItems: function() {
		let items = _.filter(this.items, function(item) {
			return item.status === 'open';
		});
		return !items || items.length === 0;
	},
	invoiceItem: function() {
		return _.find(getInvoice().items, { orderItemId: this._id });
	},
	checkAllSelected: function() {
		let items = _.filter(this.items, function(item) {
			return item.status === 'open';
		});
		return getInvoice().items.length === items.length ? 'checked' : '';
	},
	openP: function() {
        if (getInvoice().discounts) return '(';
    },
    closeP: function() {
        if (getInvoice().discounts) return ')';
    },
    itemSelected: function() {
		return !!_.find(getInvoice().items, { orderItemId: this._id });
	},
	itemTotal: function() {
        let discount = this.discount || 0;
        return (this.quantity * this.price) * ((100 - discount)/100);
    },
    invoiceItemTotal: function() {
    	let invoiceItem = _.find(getInvoice().items, { orderItemId: this._id });
    	let discount = this.discount || 0;
        return (invoiceItem.quantity * this.price) * ((100 - discount)/100);
    },
    cSubTotal: function() {
        let invoice = getInvoice();
        let discount = invoice.discounts || 0;
        let shippingCosts = numberizeD(invoice.shippingCosts) || 0;
        let subTotal = 0;

        _.each(invoice.items, function(item) {
            let d = item.discount || 0;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
            }
        });

        subTotal = Core.roundMoney((subTotal + shippingCosts - discount), invoice.currency.iso);
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
        let invoice = getInvoice();
        let discount = invoice.discounts || 0;
        let shippingCosts = numberizeD(invoice.shippingCosts) || 0;
        let taxes = 0;
        let subTotal = 0;

        _.each(invoice.items, function(item) {
            let d = item.discount || 0;
            let tax = item.taxRateOverride;
            if (!item.isPromo && item.status !== 'deleted') {
                subTotal += numberizeD((item.quantity * item.price * ((100 - d)/100)));
                taxes += numberizeD((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
            }
        });

        let effectiveTaxRate = subTotal ? taxes / subTotal : 0;
        taxes = Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), invoice.currency.iso);
        Template.instance().state.set('cTaxes', taxes);
        return taxes;
    },
    cTotal: function() {
        let invoice = getInvoice();
        let subTotal = Template.instance().state.get('cSubTotal');
        let taxes = Template.instance().state.get('cTaxes');

        total = Core.roundMoney((subTotal + taxes), invoice.currency.iso);
        Template.instance().state.set('cTotal', total);
        return total;
    },
    disableSubmit: function() {
            let invoiceContext = Core.Schemas.Invoice.namedContext("invoiceForm");
            if (invoiceContext.isValid()) return '';
            return 'disabled';
    }
    
});

/*****************************************************************************/
/* InvoiceCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.InvoiceCreate.onCreated(function () {
    //retrieve or create new order shell
    this.state = new ReactiveDict();
    let self = this;

    // Set invoice to initialise local computed values like discounts
    setInvoice(getInvoice());
    
    //create validation context
    let invoiceContext = Core.Schemas.Invoice.namedContext("invoiceForm");
    
    this.autorun(function() {
        self.subscribe('VariantsForOrder', Template.parentData()._id);
        
        let strippedInvoice = prepareInvoice(getInvoice());
        if (strippedInvoice) {
            invoiceContext.validate(strippedInvoice);
            if (invoiceContext.isValid()) {
                    console.log('Invoice is Valid!');
            } else {
                    console.log('Invoice is not Valid!');
            }
            console.log(invoiceContext._invalidKeys);
        }

    });
       
});

Template.InvoiceCreate.onRendered(function () {
});

Template.InvoiceCreate.onDestroyed(function () {
});

function getInvoice() {
    let invoice = Session.get('draftInvoice');
    if (invoice) {
        return JSON.parse(invoice);
    } else {
        // route back to order details view
        Router.go('orders.detail', { _id: Template.parentData()._id });
        return;
    }
}

function setInvoice(invoice) {
    let order = Orders.findOne(Template.parentData()._id);
    invoice.discounts = order && order.discounts ? (Core.getDocumentRawTotal(invoice.items) / order.rawTotal()) * order.discounts : 0;
    Session.set('draftInvoice', JSON.stringify(invoice));
}

function prepareInvoice(invoice) {
    if (invoice) {
        // remove bogus items and clean up
        _.forEach(invoice.items, function(i) {
            
            // numberize
            i.quantity = numberize(i.quantity);
            i.price = numberize(i.price);
            i.discount = numberize(i.discount);  
            i.taxRateOverride = numberize(i.taxRateOverride);
        
        })
        
        // record totals
        invoice.subTotal = numberize(Template.instance().state.get('cSubTotal'));
        invoice.taxes = numberize(Template.instance().state.get('cTaxes'));
        invoice.total = numberize(Template.instance().state.get('cTotal'));
        invoice.issuedAt = new Date();
        invoice.shipAt = new Date(invoice.shipAt);
        invoice.invoicedAt = new Date(invoice.invoicedAt);
    }
    return invoice;
}

function numberize(n) {
        return Math.round(_.isNaN(Number(n)) ? 0 : Number(n));  //upgrade to 2 decimals
}

function numberizeD(n) {
    return _.isNaN(Number(n)) ? 0 : Number(n);  //upgrade to 2 decimals
}