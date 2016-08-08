import accounting from 'accounting';
import Ladda from 'ladda';

/*****************************************************************************/
/* OrderEdit: Event Handlers */
/*****************************************************************************/

Template.OrderEdit.events({
	'submit form, click #edit-order': function(e, tmpl) {
		e.preventDefault();
		let orderContext = Core.Schemas.Order.namedContext("orderForm");
		if (orderContext.isValid()) {
			let order = prepareOrder(getOrder());
			Meteor.call('promotions/applyRulesToOrder', order, function(error, result) {
				if (error) {
					swal({
						title: "Oops!",
						text: error.reason,
						confirmButtonClass: "btn-error",
						type: "error",
						confirmButtonText: "OK"
					});
				} else {
					let postPromoOrder = applyRewardsToOrder(result, getOrder(), tmpl);
					setPostPromoOrder(postPromoOrder);
					let confOrder = getOrder();
					confOrder.isInConfirmation = true;
					setOrder(confOrder, true);
				}
			});
		} else {
			// load validation errors
		}
	},
	'click #cancel-order': function(e, tmpl) {
		let self = this;
		swal({
				title: "Are you sure?",
				text: "You will lose any changes you made!",
				type: "warning",
				showCancelButton: true,
				cancelButtonText: "Cancel",
				confirmButtonClass: "btn-danger",
				confirmButtonText: "Yes, exit!",
				closeOnConfirm: true
			},
			function() {
				clearOrder();
				/*
				swal({
					title: "Cancelled",
					text: "Your draft order has been deleted.",
					confirmButtonClass: "btn-info",
					type: "info",
					confirmButtonText: "OK"
				});*/
				Router.go('orders.detail', { _id: self._id });
				
			});
	},
	'change .form-control, click .onoffswitch-checkbox': function(e, tmpl) {
		let field = e.currentTarget.dataset.field;
		let value = e.currentTarget.value;
		if (e.currentTarget.type === 'checkbox') value = e.currentTarget.checked;
		let order = getOrder();
		if (field) order[field] = value;
		
		setOrder(order);
	},
	'click button.btn.dropdown-toggle.btn-default': function(e, tmpl) {
		// refresh selectpicker before rendering
		tmpl.$(e.currentTarget.parentNode.parentNode).find('select').selectpicker('refresh');
	},
	'change [name=selectSalesLocation]': function(e, tmpl) {
		let value = tmpl.$('[name=selectSalesLocation]').val();
		let order = getOrder();
		order.salesLocationId = value;
		setOrder(order);
	},
	'change [name=selectStockLocation]': function(e, tmpl) {
		let value = tmpl.$('[name=selectStockLocation]').val();
		let order = getOrder();
		order.stockLocationId = value;
		setOrder(order);
	},
	'change [name=selectAssignee]': function(e, tmpl) {
		let value = tmpl.$('[name=selectAssignee]').val();
		let order = getOrder();
		order.assigneeId = value;
        setOrder(order, true);
	},
	'keyup input[data-ifield=quantity], change input[data-type=item]': function(e, tmpl) {
		let index = e.currentTarget.dataset.index;
		let field = e.currentTarget.dataset.ifield;
		let value = e.currentTarget.value;
		let order = getOrder();

		let noRefresh;
        if (field === 'quantity') {
            value = value.replace(/,/g, '');
            value = numberize(value);
            value = value < 0 ? 0 : value;
            tmpl.$('input#txtQty-' + index).val(accounting.formatNumber(value));
            noRefresh = true;
        }
        if (field) order.items[index][field] = value;
        setOrder(order, noRefresh);
	},
	'keypress input[data-ifield=quantity]': function(e, tmpl) {
		// prevent non-number input
		if (e.which < 48 || e.which > 57) {
			e.preventDefault();
		}
	},
	'change [name=selectOrderType]': function(e, tmpl) {
		let orderType = tmpl.$('[name=selectOrderType]').val();
		let order = getOrder();
		order.orderType = orderType;
		setOrder(order, true);
	},
	'click [name=btnAddItem]': function(e, tmpl) {
		let order = getOrder();
		order.items.push({
			"index": order.items.length,
			"quantity": 0,
			"status": "open",
			"taxRateOverride": order.taxRate,
			"discount": 0
		});
		setOrder(order, true);
	},
	'click [name=btnAddShipping]': function(e, tmpl) {
        let order = getOrder();
        order.showShipping = true;
		setOrder(order, true);
    },
    'click .remove-item': function(e, tmpl) {
		let index = e.currentTarget.dataset.index;
		let order = getOrder();
		order.items.splice(index, 1);

		//refactor index
		for (i in order.items) {
			order.items[i].index = i;
		}
		setOrder(order, true);
	},
	'input #txtCustomerSearch': function(e, tmpl) {
		let $input = tmpl.$('#txtCustomerSearch');
		let searchText = $input.val();
		let self = this;

		if (searchText.length >= 3) { 
			Meteor.call('customers/getCustomers', searchText, function(err, customers) {
				if (err) {
					console.log('Error: ' + err);
				} else {
					let obj = [],
						i = 0;
					_.forEach(customers, function(c) {

						// text
						cText = c.name || c.description;
						if (cText && cText.length > 42) cText = cText.substring(0, 42) + '...';

						obj[i++] = { id: c._id, name: cText, customerNumber: c.customerNumber };
					});
					let res = $('#divCustomerSearch');
					$(res).html('');
					_.forEach(obj, function(el) {
						$(res).append('' +
							'<div class="customer-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
							'<div class="col-sm-10 col-xs-10 n-side-padding">' +
							el['name'] + ' <span class="text-muted"><small>' + el['customerNumber'] + '</small></span>' +
							'</div>' +
							'<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
							'<span class="text-muted"><a href="' + Router.path('distributors.detail', { _id: el['id'] }) + '" data-id="' + el['id'] + '" class="customer-link">View</a></span>' +
							'</div>' +
							'<div class="clearfix"></div>' +
							'</div><div class="clearfix"></div></div>'
						);
					});
					if (customers && customers.length > 0) $(res).show();
					else $(res).hide();

				}
			});
		} else {
            $(`#divCustomerSearch`).hide();
        }	

	},
	'blur input.customer-search': function(e, tmpl) {
		setTimeout(function() {
			$('.customer-search-result').hide();
		}, 100);

	},

	'mousedown .customer-link': function(e, tmpl) {
		let customerData = e.currentTarget.dataset;
		Router.go('distributors.detail', { _id: customerData.id });

	},

	'click .customer-search-elem, mousedown .customer-search-elem': function(e, tmpl) {
		let customerData = e.currentTarget.dataset;
		let order = getOrder();
		order.customerId = customerData.id;
		tmpl.$('#txtCustomerSearch').val(customerData.name);

		setOrder(order);

	},

	'mouseup .customer-search-elem': function(e, tmpl) {
		setTimeout(function() {
			$('.customer-search-result').hide();
		}, 100);

	},
	'input input.fast-search': function(e, tmpl) {
		let order = getOrder();
		let searchText = e.target.value;
		let priceListCodes;
        let locationId = order.stockLocationId;
        let self = this;
        if (order.priceListGroup) priceListCodes = order.priceListGroup.priceListCodes;

        if (searchText.length >= 3) {  
			Meteor.call('products/getVariants', searchText, locationId, priceListCodes, function(err, variants) {
				if (err) {
					console.log('Error: ' + err);
				} else {
					let obj = [],
						i = 0;
					_.each(variants, function(v) {

						// text
						vText = v.name || v.description;
						if (vText && vText.length > 36) vText = vText.substring(0, 36) + '..';

						// amount
						vAmountString = '';
						vAmount = 0;
						if (v.variantPrices && v.variantPrices.length > 0) {
							vAmount = v.variantPrices[0].value;
						} else {
							vAmount = v.wholesalePrice;
						}

						vAmountString = Core.numberWithDecimals(vAmount);

						vCode = v.code ? ', ' + v.code : '';

						// quantity
						vQuantity = 0;
						if (v.locations && v.locations.length > 0) {
	                        vQuantity = v.locations[0].stockOnHand;
	                        obj[i++] = [v._id, vText, vAmountString, vQuantity, v.code, v.name, v.uom, vAmount, vCode];
	                    }
					});
					let res = $(`#divSearch_${self.index}`);
					$(res).html('');
					_.forEach(obj, function(el) {
						$(res).append('' +
							'<div class="fast-search-elem" data-price="' + el[7] + '" data-available="' + el[3] + '" data-name="' + el[5] + '" data-uom="' + el[6] + '" data-code="' + el[4] + '" data-id="' + el[0] + '" data-caption="' + el[1] + '"><div>' +
							'<div class="col-sm-9 col-xs-9 n-side-padding">' +
							el[1] + '<span class="text-muted"><small>' + el[8] + '</small></span>' +
							'</div>' +
							'<div class="col-sm-2 col-xs-2 n-side-padding pr20 fs11 text-right text-nowrap">' +
							order.currency.symbol + el[2] +
							'</div>' +
							'<div class="col-sm-1 col-xs-1 n-side-padding fs11 text-right">' +
							'<span class="badge text-muted">' + el[3] + '</span>' +
							'</div>' +
							'<div class="clearfix"></div>' +
							'</div><div class="clearfix"></div></div>'
						);
					});
					if (variants && variants.length > 0) $(res).show();
					else $(res).hide();
				}

			});
		} else {
            $(`#divSearch_${self.index}`).hide();
        }

	},
	'blur input.fast-search': function(e, tmpl) {
		setTimeout(function() {
			$('.fast-search-result').hide();
		}, 100);
	},
	'click .fast-search-elem, mousedown .fast-search-elem': function(e, tmpl) {

		let variantData = e.currentTarget.dataset;
		let order = getOrder();

		//update input text. Useful as reactive update will not happen if selected variant does not change
		tmpl.$(e.currentTarget.parentNode.parentNode).find('input').val(variantData.code + ', ' + variantData.name);

		order.items[this.index].variantId = variantData.id;
		order.items[this.index].price = variantData.price;
		order.items[this.index].bogusVariant = variantData;
		setOrder(order);
	},
	'mouseup .fast-search-elem': function(e, tmpl) {
		setTimeout(function() {
			$('.fast-search-result').hide();
		}, 100);

	},
	'click input[name=checkCredits]': function(e, tmpl) {

		let order = getOrder();
		if (e.target.checked) {
			let customer = order.bogusCustomer;
			let availBal = 0;
			if (customer && customer.account) availBal = customer.account.availableBalance;

			order.canApplyCredit = true;
			order.appliedCredits = availBal; //this will subsequently be normalized

		} else {
			order.appliedCredits = 0;
			order.canApplyCredit = false;
		}

		setOrder(order, true);
	},
	'click [name=refreshCredits]': function(e, tmpl) {

		let order = getOrder();
		if (order.canApplyCredit) {
			let customer = order.bogusCustomer;
			let availBal = 0;
			if (customer && customer.account) availBal = customer.account.availableBalance;

			order.appliedCredits = availBal; // this will subsequently be normalized
		}

		setOrder(order, true);


	},
	'keypress input[name=txtCredits]': function(e, tmpl) {
		// prevent non-number input
		if ((e.which < 48 || e.which > 57) && e.which !== 190)
		{
			e.preventDefault();
		}
	},
	'keyup input[name=txtCredits], change input[name=txtCredits]': function(e, tmpl) {
		// get amount
		let order = getOrder();
		let amount = tmpl.$('input[name=txtCredits]').val();
		if (amount) amount = amount.replace(/,/g,'');
		order.appliedCredits = amount;
		setOrder(order);
		normalizeCredits();

		tmpl.$('input[name=txtCredits]').val(getOrder().appliedCredits === 0 ? '' : accounting.formatNumber(getOrder().appliedCredits));
	},
	'click input[name=checkCashPayment]': function(e, tmpl) {

		let order = getOrder();
		if (e.target.checked) {
			order.canPayCash = true;
			order = setDefaultCashPaymentMethod(order);
		} else {
			order.cashPayment = 0;
			order.canPayCash = false;
		}

		setOrder(order, true);
	},
	'keypress input[name=txtCashPayment]': function(e, tmpl) {
		// prevent non-number input
		if ((e.which < 48 || e.which > 57) && e.which !== 190)
		{
			e.preventDefault();
		}
	},
	'keyup input[name=txtCashPayment], change input[name=txtCashPayment]': function(e, tmpl) {
		// get amount
		let order = getOrder();
		let amount = tmpl.$('input[name=txtCashPayment]').val();
		if (amount) amount = amount.replace(/,/g, '');

		let total = numberize(tmpl.state.get('cTotal'));
		let totalDue = total - numberize(order.madePayments);
		amount = amount > totalDue ? totalDue : amount;
		order.cashPayment = amount;
		setOrder(order, true);

		tmpl.$('input[name=txtCashPayment]').val(getOrder().cashPayment === 0 ? '' : accounting.formatNumber(getOrder().cashPayment));
	},
	'click a[name=cash-option]': function(e, tmpl) {
		let name = e.currentTarget.innerText;
		let code = e.currentTarget.dataset.code;

		let order = getOrder();
		order.cashPaymentMethod = { name: name, code: code };
		setOrder(order, true);


	},
	'keypress input.input-discounts': function(e, tmpl) {
		// prevent non-number input
		console.log(e.which);
		if ((e.which < 48 || e.which > 57) && e.which !== 46)
		{
			e.preventDefault();
		}
	},
	'keyup input.input-discounts, change input.input-discounts': function(e, tmpl) {
		// get amount
		let order = getOrder();
		let amount = e.currentTarget.value; //tmpl.$('input[name=txtCashPayment]').val();
		if (amount) amount = amount.replace(/,/g,'');

		let field = e.currentTarget.dataset.ref;
		if (field) order[field] = amount;
		setOrder(order, true);

		//tmpl.$(e.currentTarget).val(amount === 0 ? '' : accounting.formatNumber(amount));
		//tmpl.$('input[name=txtShipping]').val('800');
	}

});

/*****************************************************************************/
/* OrderEdit: Helpers */
/*****************************************************************************/
Template.OrderEdit.helpers({
	orderTypes: function() {
		return OrderTypes.find().fetch();
	},
	order: function() {
		return getOrder();
	},
	arrayedOrder: function() {
		return [getOrder()];
	},
	customer: function() {
		let order = this;
		if (order.customerId) return order.bogusCustomer;
	},
	arrayedCustomer: function() {
		let order = this;
		if (order.customerId) return [order.bogusCustomer];
	},
	customerAddressBook: function() {
		let order = this;
		if (order.customerId) return order.bogusCustomer.addressBook;
	},
	selected: function(refVal, compareVal) {
		if (String(refVal) === String(compareVal)) return 'selected';
		return '';
	},
	orderItems: function() {
		return this.items;
	},
	salesUsers: function() {
		return Meteor.users.find().fetch();
	},
	userEmail: function() {
		return this.emails[0].address;
	},
	itemTotal: function() {
		let d = this.discount ? this.discount : 0;
		let iTotal = this.quantity * this.price * ((100 - d) / 100);
		return iTotal //numberize(iTotal);
	},
	billingAddress: function() {
        let order = this;
        if (order.customerId && order.bogusCustomer) {
            let customerAddressBook = order.bogusCustomer.addressBook;
            let billingAddress = _.find(customerAddressBook, function(address) {
                return address._id === order.billingAddressId;
            });
            return [billingAddress];
        }
    },
    shippingAddress: function() {
        let order = this;
        if (order.customerId && order.bogusCustomer) {
            let customerAddressBook = order.bogusCustomer.addressBook;
            let shippingAddress = _.find(customerAddressBook, function(address) {
                return address._id === order.shippingAddressId;
            });
            return [shippingAddress];
        }
    },
    cSubTotal: function() {
		let order = this;
		let discount = order.discounts || 0;
		let shippingCosts = numberizeD(order.shippingCosts) || 0;
		let subTotal = 0;

		_.each(order.items, function(item) {
			let d = item.discount || 0;
			if (!item.isPromo && item.status !== 'deleted') {
				subTotal += numberizeD((item.quantity * item.price * ((100 - d) / 100)));
			}
		});

		subTotal = Core.roundMoney((subTotal + shippingCosts - discount), order.currency.iso);
		Template.instance().state.set('cSubTotal', subTotal);
		return subTotal;

	},
	cTaxes: function() {
		let order = this;
		let discount = order.discounts || 0;
		let shippingCosts = numberizeD(order.shippingCosts) || 0;
		let taxes = 0;
		let subTotal = 0;

		_.each(order.items, function(item) {
			let d = item.discount || 0;
			let tax = item.taxRateOverride;
			if (!item.isPromo && item.status !== 'deleted') {
				subTotal += numberizeD((item.quantity * item.price * ((100 - d) / 100)));
				taxes += numberizeD((item.quantity * item.price * ((100 - d) / 100))) * (tax / 100);
			}
		});

		let effectiveTaxRate = taxes / subTotal
		taxes = Core.roundMoney(taxes + ((shippingCosts - discount) * effectiveTaxRate), order.currency.iso);
		Template.instance().state.set('cTaxes', taxes);
		return taxes;
	},
	cTotal: function() {
		let order = this;
		let subTotal = Template.instance().state.get('cSubTotal');
		let taxes = Template.instance().state.get('cTaxes');

		total = Core.roundMoney((subTotal + taxes), order.currency.iso);
		Template.instance().state.set('cTotal', total);
		return total;
	},
	showShipping: function() {
        return this.showShipping || this.shippingCosts > 0;
    },
    openP: function() {
		if (this.discounts) return '(';
	},
	closeP: function() {
		if (this.discounts) return ')';
	},
	remAvailableBalance: function() {
		let order = this;
		let customer = order.bogusCustomer;
		let remAvail = 0;
		if (customer && customer.account) {
			if (customer.account.availableBalance > 0) remAvail = customer.account.availableBalance - order.appliedCredits;
		}
		return remAvail;
	},
	disabledCreditsAvailable: function() {
		customer = this.bogusCustomer;
		if (customer) {
			if (customer.account && (customer.account.availableBalance > 0)) return '';
		}
		return 'disabled';
	},
	disabledCanApplyCredit: function() {
		let order = this;
		if (order.canApplyCredit) return '';
		return 'disabled';
	},
	checkedCanApplyCredit: function() {
		let order = this;
		if (order.canApplyCredit) return 'checked';
		return '';
	},
	enabledCanApplyCredit: function() {
        let order = this;
        if (order.canApplyCredit) return 'panel-success';
        return '';
    },
    disabledCanPayCash: function() {
		let order = this;
		if (order.canPayCash) return '';
		return 'disabled';
	},
	checkedCanPayCash: function() {
		let order = this;
		if (order.canPayCash) return 'checked';
		return '';
	},
	enabledCanPayCash: function() {
        let order = this;
        if (order.canPayCash) return 'panel-success';
        return '';
    },
    totalDue: function() {
		let cTotal = numberize(Template.instance().state.get('cTotal'));
		let order = this;
		let customer = order.bogusCustomer;
		let cTotalDue = cTotal - order.appliedCredits - order.cashPayment - order.madePayments;
		return cTotalDue;
	},
	disableSubmit: function() {
		let orderContext = Core.Schemas.Order.namedContext("orderForm");
		if (orderContext.isValid()) return '';
		else return 'disabled';
	},
	orderPriceLists: function() {
		return this.priceLists;
	},
	cashPaymentMethods: function() {
		return getPaymentMethods();
	},
	customerHasCredit: function () {
		return customerHasCredit();
	},
	creditHeaderTreatment: function() {
		return customerHasCredit() ? "sub-content-sec" : "not_margin_head";
	},
	appliedCredit: function(){
		let order = this;
		if (order.appliedCredits > 0) return accounting.formatNumber(order.appliedCredits);
		return '';
	},
	hasBalanceApplied: function(){
		return !!this.appliedCredits;
	},
	hasPayments: function(){
		return !!Template.parentData().payments();
	}
});

/*****************************************************************************/
/* OrderEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.OrderEdit.onCreated(function() {
	//if order is not open, redirect to details view 
	let editOrder = Orders.findOne(Template.parentData()._id);
	if (editOrder.status !== 'open') Router.go('orders.detail', { _id: Template.parentData()._id });

	//retrieve or create new order shell
	this.state = new ReactiveDict();
	let self = this;

	// Clear productvariants cache
    ProductVariantSubs.clear();
    InvoiceSubs.clear();
    ReturnOrderSubs.clear();

	//create validation context
	let orderContext = Core.Schemas.Order.namedContext("orderForm");
	let order = initOrder(editOrder);
	
	// prep customer and dependencies
	if (order.customerId) {
		// check if customer changed
		let newCustomer = Customers.findOne(order.customerId);
		if (newCustomer) {
			
			order.bogusCustomer = newCustomer;
			order.customerName = newCustomer.name;

			// find any existing holds
			let custHold = CustomerHolds.findOne({ orderNumber: order.orderNumber });
			if (custHold) {
				if (order.bogusCustomer.account) order.bogusCustomer.account.availableBalance += order.appliedCredits;
			}

			let custGroup = CustomerGroups.findOne({ code: order.bogusCustomer.groupCode });
			if (custGroup) order.isPickup = custGroup.isPickupDefault;
			
			// set up priceLists
            order.priceLists = PriceListGroups.find({ currencyISO: order.currency.iso }).fetch();
            order.priceLists = _.filter(order.priceLists, function(p) {
                return !p.customerGroupCodes || p.customerGroupCodes.length === 0 || _.contains(p.customerGroupCodes, custGroup ? custGroup.code : ''); // return pricelists that for this group or group-insensitive
            });

            
		} else {
			delete order.customerId;
			delete order.bogusCustomer;
		}
		setOrder(order);
	}


	this.autorun(function(computation) {
		/*
		computation.onInvalidate(function() {
            console.log('Trace...');
            console.trace();
        });*/

        let strippedOrder = prepareOrder(getOrder());
		orderContext.validate(strippedOrder);
		
		if (orderContext.isValid()) {
			console.log('Order is Valid!');
		} else {
			console.log('Order is not Valid!');
		}
		console.log(orderContext._invalidKeys);

		let order = getOrder();
		let postPromoOrder = getPostPromoOrder();
		//console.log('autorun', order);
		
		//subscribe to SalesUsers for the region
		let salesLocation = Locations.findOne(order.salesLocationId);
		if (salesLocation) {
			UserSubs.subscribe('SalesUsers', salesLocation.salesArea);
		}

		if (order.noRefresh && !order.isInConfirmation) return;


		//subscribe to productvariants
		if (order.items[0].variantId) {
			// retrieve variantIds
			let variantIds = postPromoOrder ? _.union(_.pluck(postPromoOrder.items, 'variantId'), _.pluck(order.items, 'variantId')) : _.pluck(order.items, 'variantId');
			

			let priceListCodes;
            if (order.priceListGroup) priceListCodes = order.priceListGroup.priceListCodes;
            self.subscribe('OrderVariants', variantIds, order.stockLocationId, priceListCodes);


			if (self.subscriptionsReady()) {
				for (let i in order.items) {
					v = ProductVariants.findOne(order.items[i].variantId);
					if (v) {
						order.items[i].bogusVariant = v;
						// prep display caption
						let shortTag = v.name.length > 36 ? v.name.substring(0, 36) + '..' : v.name;
						order.items[i].bogusVariant.caption = v.code + ', ' + shortTag;


						order.items[i].bogusVariant.available = 0;
						if (v.locations && v.locations.length > 0) order.items[i].bogusVariant.available = v.locations[0].stockOnHand;

						if (v.variantPrices && v.variantPrices.length === 1) {
                            order.items[i].price = v.variantPrices[0].value;
                        } else if (v.variantPrices && v.variantPrices.length > 1) {
                            // extract v.variantPrices
                            let variantPriceCodes = _.pluck(v.variantPrices, 'priceListCode');
                            let priceListCodes = order.priceListGroup.priceListCodes; 
                            let pCodes = _.intersection(variantPriceCodes, priceListCodes);
                            if (pCodes.length > 0) {
                                let thePriceCode = _.findWhere(v.variantPrices, { priceListCode: pCodes[0]});
                                order.items[i].price = thePriceCode ? thePriceCode.value : v.variantPrices[0].value;
                            } else {
                                order.items[i].price = v.wholesalePrice;
                            }   

                        } else {
                            order.items[i].price = v.wholesalePrice;
                        }

						if (!v.taxable) order.items[i].taxRateOverride = 0;
					}
				}
				

				if (postPromoOrder) {
					for (let i in postPromoOrder.items) {
						if (postPromoOrder.items[i].isPromo) {
							v = ProductVariants.findOne(postPromoOrder.items[i].variantId);
							if (v) {
								postPromoOrder.items[i].bogusVariant = v;

								// prep display caption
								let shortTag = v.name.length > 36 ? v.name.substring(0, 36) + '..' : v.name;
								postPromoOrder.items[i].bogusVariant.caption = v.code + ', ' + shortTag;


								postPromoOrder.items[i].bogusVariant.available = 0;
								if (v.locations && v.locations.length > 0) postPromoOrder.items[i].bogusVariant.available = v.locations[0].stockOnHand;
								postPromoOrder.items[i].price = 0;

								if (!v.taxable) postPromoOrder.items[i].taxRateOverride = 0;
							}
						}
					}
					setPostPromoOrder(postPromoOrder);
				}
				setOrder(order);
			}

		}



		/*
		 */

	});
});

Template.OrderEdit.onRendered(function() {
	let self = this;

	this.autorun(function() {
		// retrieve amount and total, recompute appliedCredits and update
		/*
		if (self.$('input[name=txtCredits]')) {
			let order = getOrder();
			if (order.canApplyCredit) {
				self.$('.panel-checkbox-color ').addClass('panel-success');
				self.$('input[name=txtCredits]').removeAttr('disabled');

			} else {
				self.$('.panel-checkbox-color ').removeClass('panel-success');
				self.$('input[name=txtCredits]').attr('disabled', 'disabled');
			}
			self.$('input[name=txtCredits]').val(order.appliedCredits === 0 ? '' : accounting.formatNumber(order.appliedCredits));
		}

		if (self.$('input[name=txtCashPayment]')) {
			let order = getOrder();
			if (order.canPayCash) {
				self.$('.panel-checkbox-color-cp ').addClass('panel-success');
				self.$('input[name=txtCashPayment]').removeAttr('disabled');

			} else {
				self.$('.panel-checkbox-color-cp ').removeClass('panel-success');
				self.$('input[name=txtCashPayment]').attr('disabled', 'disabled');
			}
			self.$('input[name=txtCashPayment]').val(order.cashPayment === 0 ? '' : accounting.formatNumber(order.cashPayment));

		}
		*/


		if (self.subscriptionsReady()) {

			// refresh all selects
            Meteor.defer(function() {
                try {
                    self.$('[name=selectSalesLocation]').selectpicker('refresh');
                    self.$('[name=selectStockLocation]').selectpicker('refresh');
                    self.$('[name=selectAssignee]').selectpicker('refresh');
                } catch (e) {

                }
            });

		}


	});

});

/*****************************************************************************/
/* EditOrderConfirm: Event Handlers */
/*****************************************************************************/
Template.EditOrderConfirm.events({
	'submit form, click #confirm-order': function(e, tmpl) {
		e.preventDefault();
		let orderContext = Core.Schemas.Order.namedContext("finalOrderForm");
		if (orderContext.isValid()) {
			// Load button animation
            tmpl.$('#confirm-order').text('Saving... ');
            tmpl.$('#confirm-order').attr('disabled', true);
            
            try {
            	let l = Ladda.create(tmpl.$('#confirm-order')[0]);
            	l.start();
            } catch(e) {
            	console.log(e);
            }
            

            let resetButton = function() {
                // End button animation
                try {
                	let l = Ladda.create(tmpl.$('#confirm-order')[0]);
            		l.stop();
                	l.remove();
                } catch(e) {
                	console.log(e);
                }
                
                tmpl.$('#confirm-order').text('Save ');
                
                // Add back glyphicon
                let icon = document.createElement('span');
                icon.className = 'glyphicon icon-order';
                tmpl.$('#confirm-order')[0].appendChild(icon);

                tmpl.$('#confirm-order').removeAttr('disabled');
            }

			let order = prepareFinalOrder(getPostPromoOrder());
			Meteor.call('orders/updateOrder', order._id, order, function(error, result) {
				if (error) {

					swal({
						title: "Oops!",
						text: error.reason,
						confirmButtonClass: "btn-error",
						type: "error",
						confirmButtonText: "OK"
					});
				    resetButton();
               
				} else {
					if (getOrder().cashPayment > 0) {
						Meteor.call('payments/createPayment', prepareCashPayment(getOrder(), result), function(err, res) {
							if (err) {
								console.log('Cannot Post Payment: ', err);
                                swal({
									title: "Success",
									text: `Order ${result.orderNumber} has been created. \nCould not post your cash payment, please retry`,
									confirmButtonClass: "btn-success",
									type: "success",
									confirmButtonText: "OK"
								});

								// wipe slate clean
								clearOrder();

								// switch to order edit
								//Router.go('orders.edit', { _id: result._id })

							} else {
								let payAmount = accounting.formatNumber(getOrder().cashPayment);
                                swal({
									title: "Success",
									text: `Order ${result.orderNumber} has been updated. \nA ${getOrder().cashPaymentMethod.name.toLowerCase()} payment has been posted for ${getOrder().currency.symbol} ${payAmount}`,
									confirmButtonClass: "btn-success",
									type: "success",
									confirmButtonText: "OK"
								});

								//wipe slate clean
								clearOrder();

								// switch to order detail
								Router.go('orders.detail', { _id: result._id })
							}
							resetButton();
						});

					} else {
						swal({
							title: "Success",
							text: `Order ${result.orderNumber} has been updated`,
							confirmButtonClass: "btn-success",
							type: "success",
							confirmButtonText: "OK"
						});

						// wipe slate clean
						delete Session.keys['editOrder'];
						resetButton();

						// switch to order detail
						Router.go('orders.detail', { _id: result._id })
					}


				}
			});
		} else {
			// load validation errors
		}
	},
	'click #cancel-confirm': function(e, tmpl) {
		let confOrder = getOrder();
		confOrder.isInConfirmation = false;
		setOrder(confOrder);

	}

});

/*****************************************************************************/
/* EditOrderConfirm: Helpers */
/*****************************************************************************/
Template.EditOrderConfirm.helpers({
	orderTypes: function() {
		return OrderTypes.find().fetch();
	},
	order: function() {
		return getPostPromoOrder();
	},
	arrayedOrder: function() {
		return [getPostPromoOrder()];
	},
	customer: function() {
		let order = this;
		if (order.customerId) return order.bogusCustomer;
	},
	customerAddressBook: function() {
		let order = this;
		if (order.customerId) return order.bogusCustomer.addressBook;
	},
	selected: function(refVal, compareVal) {
		if (String(refVal) === String(compareVal)) return 'selected';
		return '';
	},
	orderItems: function() {
		return this.items;
	},
	standardItems: function() {
		return _.filter(this.items, function(el) { return !el.isPromo; });
	},
	promoItems: function() {
		return _.filter(this.items, function(el) { return el.isPromo; });
	},
	salesUsers: function() {
		return Meteor.users.find().fetch();
	},
	userEmail: function() {
		return this.emails[0].address;
	},
	itemTotal: function() {
		let d = this.discount ? this.discount : 0;
		let iTotal = this.quantity * this.price * ((100 - d) / 100);
		return iTotal //numberize(iTotal);
	},
	billingAddress: function() {
        let order = this;
        if (order.customerId && order.bogusCustomer) {
            let customerAddressBook = order.bogusCustomer.addressBook;
            let billingAddress = _.find(customerAddressBook, function(address) {
                return address._id === order.billingAddressId;
            });
            return [billingAddress];
        }
    },
    shippingAddress: function() {
        let order = this;
        if (order.customerId && order.bogusCustomer) {
            let customerAddressBook = order.bogusCustomer.addressBook;
            let shippingAddress = _.find(customerAddressBook, function(address) {
                return address._id === order.shippingAddressId;
            });
            return [shippingAddress];
        }
    },
    cSubTotal: function() {
		return this.subTotal;
	},
	cTaxes: function() {
		return this.taxes;
	},
	cTotal: function() {
		return this.total;
	},
	showShipping: function() {
        return this.showShipping || this.shippingCosts > 0;
    },
    openP: function() {
		if (this.discounts) return '(';
	},
	closeP: function() {
		if (this.discounts) return ')';
	},
	remAvailableBalance: function() {
		let order = this;
		let customer = order.bogusCustomer;
		let remAvail = 0;
		if (customer && customer.account) {
			if (customer.account.availableBalance > 0) remAvail = customer.account.availableBalance - order.appliedCredits;
		}
		return remAvail;
	},
	disabledCreditsAvailable: function() {
		customer = this.bogusCustomer;
		if (customer) {
			if (customer.account && (customer.account.availableBalance > 0)) return '';
		}
		return 'disabled';
	},
	disabledCanApplyCredit: function() {
		let order = this;
		if (order.canApplyCredit) return '';
		return 'disabled';
	},
	checkedCanApplyCredit: function() {
		let order = this;
		if (order.canApplyCredit) return 'checked';
		return '';
	},
	disabledCanPayCash: function() {
		let order = this;
		if (order.canPayCash) return '';
		return 'disabled';
	},
	checkedCanPayCash: function() {
		let order = this;
		if (order.canPayCash) return 'checked';
		return '';
	},
	totalDue: function() {
		let order = this;
		let customer = order.bogusCustomer;
		let cTotalDue = order.total - order.appliedCredits - order.cashPayment - order.madePayments;
		return cTotalDue;
	},
	disableSubmit: function() {
		let orderContext = Core.Schemas.Order.namedContext("finalOrderForm");
		if (orderContext.isValid()) return '';
		else return 'disabled';
	},
	orderPriceLists: function() {
		return this.priceLists;
	},
	cashPaymentMethods: function() {
		return getPaymentMethods();
	},
	promotionStatus: function() {
		return this.hasPromotions ? 'active' : 'not active';
	},
	promotionStatusStyle: function() {
		return this.hasPromotions ? 'text-success' : 'text-danger';
	},
	customerHasCredit: function () {
		return customerHasCredit();
	},
	creditHeaderTreatment: function() {
		return customerHasCredit() ? "sub-content-sec" : "not_margin_head";
	},
	hasPayments: function(){
		return !!Template.parentData(2).payments();
	}
});

/*****************************************************************************/
/* EditOrderConfirm: Lifecycle Hooks */
/*****************************************************************************/
Template.EditOrderConfirm.onCreated(function () {
	let self = this;

	//create validation context
	let orderContext = Core.Schemas.Order.namedContext("finalOrderForm");

	this.autorun(function() {
		let strippedOrder = prepareFinalOrder(getPostPromoOrder());
		orderContext.validate(strippedOrder);
		if (orderContext.isValid()) {
			console.log('Final Order is Valid!');
		} else {
			console.log('Final Order is not Valid!');
		}
		console.log(orderContext._invalidKeys);

		let order = getOrder();
	});
});

Template.EditOrderConfirm.onRendered(function () {
	let self = this;
	if (self.$('input[name=txtCredits]')) {

		let order = getPostPromoOrder();
		if (order.canApplyCredit) {
			self.$('.panel-checkbox-color-conf').addClass('panel-success');
		} else {
			self.$('.panel-checkbox-color-conf').removeClass('panel-success');
		}
	}

	if (self.$('input[name=txtCashPayment]')) {
		let order = getPostPromoOrder();
		if (order.canPayCash) {
			self.$('.panel-checkbox-color-cp-conf').addClass('panel-success');
		} else {
			self.$('.panel-checkbox-color-cp-conf').removeClass('panel-success');
		}

	}
});

Template.EditOrderConfirm.onDestroyed(function () {
});

function getOrder() {
	//retrieve or create new order shell
	let order = Session.get('editOrder');
	if (!order) order = resetDraftOrder();                                         
	return order;
}

function getPostPromoOrder() {
	return Session.get('editPostPromoOrder');
}

function setOrder(order, noRefresh) {
	order.noRefresh = !!noRefresh;
    order = Template.instance() && Template.instance().state ? normalizeCredits(order) : order; // no need to normalize if called from outside template context
    Session.set('editOrder', order);
}

function setPostPromoOrder(order) {
	Session.set('editPostPromoOrder', order);
}

function clearOrder() {
	delete Session.keys['editOrder'];
	delete Session.keys['editPostPromoOrder'];
}

function initOrder(editOrder) {
	let order = Session.get('editOrder');
	if (!order || order.orderNumber !== editOrder.orderNumber) {
		order = resetDraftOrder();
	} 
	return order;
}

function resetDraftOrder() {
	// create new order and set defaults
	let order = Orders.findOne(Template.parentData()._id);

	let madePayments = order.payments(); //set before retrieving rawOrder
	
	
	if (order.hasPromotions && order.rawOrder) {
		let orderId = order._id;
		let orderNumber = order.orderNumber;
		order = JSON.parse(order.rawOrder);
		order.orderNumber = orderNumber;
		order._id = orderId;
	}
	//order.items = _.filter(order.items, function(item) { return !item.isPromo });

	for (i in order.items) {
		order.items[i].bogusVariant = ProductVariants.findOne(order.items[i].variantId);
		if (order.items[i].bogusVariant) order.items[i].bogusVariant.available = order.items[i].bogusVariant.locations ? order.items[i].bogusVariant.locations[0].stockOnHand : 0;
		
		order.items[i].index = i;
	}

	delete order.nonCashPayments;
	delete order._groupId;
	delete order.updatedAt;

	order.isApproved = false;
	order.approvalStatus = "pending";

	order.canApplyCredit =  order.appliedCredits > 0 ? true : false;
	order.cashPayment = 0;
	order.madePayments = madePayments;
	order.priceListGroup = PriceListGroups.findOne({ code: order.priceListCode });
	delete order.createdBy

	delete order.cashPayments;
	delete order.createdBy;

	order.isInConfirmation = false;
	order = setDefaultCashPaymentMethod(order);

	// set totals
	Template.instance().state.set('cSubTotal', order.subTotal);
	Template.instance().state.set('cTaxes', order.taxes);
	Template.instance().state.set('cTotal', order.total);
	
	Session.set('editOrder', order);
	return order;
}

function normalizeCredits(theOrder) {
    let order = theOrder || getOrder();
    //if (amount) amount = amount.replace(/,/g,'');
    order.appliedCredits = numberize(order.appliedCredits);

    // check if number is outside allowed range and reset to boundaries
    total = numberize(Template.instance().state.get('cTotal'));
    let customer = order.bogusCustomer;
	if (customer && customer.account) {
		let ceil = customer.account.availableBalance > (total - order.cashPayment - order.madePayments) ? (total - order.cashPayment - order.madePayments) : customer.account.availableBalance; // choose smaller of the 2
		let floor = 0;
		order.appliedCredits = order.appliedCredits > ceil ? ceil : order.appliedCredits;
		order.appliedCredits = order.appliedCredits < floor ? floor : order.appliedCredits;
	}
    return order
}


function numberize(n) {
	return Math.round(_.isNaN(Number(n)) ? 0 : Number(n)); //upgrade to 2 decimals
}

function numberizeD(n) {
	return _.isNaN(Number(n)) ? 0 : Number(n); //upgrade to 2 decimals
}

function prepareOrder(order, tmpl) {
	tmpl = tmpl || Template.instance();
	if (order) {
		// remove bogus items and clean up
		delete order.bogusCustomer;
		_.forEach(order.items, function(i) {
			delete i.bogusVariant;
			delete i.index;

			// numberize
			i.quantity = numberize(i.quantity);
			i.price = numberizeD(i.price);
			i.discount = numberizeD(i.discount);
			i.taxRateOverride = numberizeD(i.taxRateOverride);

		})

		// remove other items
		delete order.canApplyCredit;
		delete order.canPayCash;
		delete order.cashPayment;
		delete order.cashPaymentMethod;
		delete order.priceLists;
		delete order.priceListGroup;
        delete order.isInConfirmation;
		delete order.madePayments;
		delete order.createdBy;
		delete order.noRefresh;

		order.discounts = numberizeD(order.discounts);
		order.shippingCosts = numberizeD(order.shippingCosts);

		// resolve dates
		order = resolveDates(order);

		// record totals
		order.subTotal = numberize(tmpl.state.get('cSubTotal'));
		order.taxes = numberize(tmpl.state.get('cTaxes'));
		order.total = numberize(tmpl.state.get('cTotal'));

		// numberize orderType
		order.orderType = numberize(order.orderType);
	}
	return order;
}

function prepareFinalOrder(order) {
	if (order) {
		// remove bogus items and clean up
		delete order.bogusCustomer;
		_.forEach(order.items, function(i) {
			delete i.bogusVariant;
			delete i.index;

			// numberize
			i.quantity = numberize(i.quantity);
			i.price = numberizeD(i.price);
			i.discount = numberizeD(i.discount);
			i.taxRateOverride = numberizeD(i.taxRateOverride);

		})

		// remove other items
		delete order.canApplyCredit;
		delete order.canPayCash;
		delete order.cashPayment;
		delete order.cashPaymentMethod;
		delete order.priceLists;
		delete order.priceListGroup;
        delete order.isInConfirmation;
		delete order.madePayments;
		delete order.createdBy;
		delete order.noRefresh;

		order.discounts = numberizeD(order.discounts);
		order.shippingCosts = numberizeD(order.shippingCosts);

		// resolve dates
		order = resolveDates(order);

		// numberize orderType
		order.orderType = numberize(order.orderType);
	}
	return order;
}

function resolveDates(order) {
	if (order) {
		if (order.issuedAt) order.issuedAt = new Date(order.issuedAt);
		if (order.createdAt) order.createdAt = new Date(order.createdAt);
		if (order.shipAt) order.shipAt = new Date(order.shipAt);

		if (order.history && order.history.length > 0) {
			for (i in order.history) {
				order.history[i].createdAt = new Date(order.history[i].createdAt);
			}
		}

		if (order.approvals && order.approvals.length > 0) {
			for (i in order.approvals) {
				order.approvals[i].approvedAt = new Date(order.approvals[i].approvedAt);
			}
		}
	}
	return order;
}

function prepareCashPayment(order, result) {
	if (order && result) {
		// extract payment info
		let payment = {
			"orderId": result._id,
			"orderNumber": result.orderNumber,
			"amount": numberizeD(order.cashPayment),
			"reference": Random.id(),
			"isCashInHand": true,
			"paymentMethod": { name: order.cashPaymentMethod.name, code: order.cashPaymentMethod.code },
			"paidAt": new Date
		}

		return payment;
	}
}

function getPaymentMethods() {
	return PaymentMethods.find({ isCashInHand: true });
}

function setDefaultCashPaymentMethod(order) {
	if (order.cashPaymentMethod) {
		return order;
	} else {
		//let defaultCashPaymentMethod;
		let defaultCashPaymentMethod = PaymentMethods.findOne({ isCashInHand: true });
		if (defaultCashPaymentMethod) {
			order.cashPaymentMethod = defaultCashPaymentMethod;
		} else {
			order.cashPaymentMethod = { name: 'Cash', code: '10' };
		}
		return order;
	}

}

function customerHasCredit() {
	let order = getOrder();
	if (order.customerId && order.bogusCustomer) return order.bogusCustomer.availableCreditLimit > 0;
	return false;
}

function applyRewardsToOrder(promotions, order, tmpl) {
	if (promotions.length > 0) {
		order.rawOrder = JSON.stringify(prepareOrder(getOrder(), tmpl));
		order.hasPromotions = true;
		_.each(promotions, function(promotion) {
			/*
			 * @Todo
			 * resolve conflicts on promotions
			 * promotion.exclusive [false, true]
			 * promotion.priority [low, normal, high]
			 */
			//resolve currency clashes
			if (promotion.currency === order.currency.iso) {

				_.each(promotion.rewards, function(reward) {
					let discount;
					switch (reward.type) {
						case 'addOn':
							let addOnItem = {
								discount: 0,
								quantity: reward.value,
								status: "open",
								taxRateOverride: Core.getTenantTaxRate(),
								variantId: reward.subTypeValue,
								isPromo: true
							};
							order.items.push(addOnItem);
							let priceListCodes;
                            if (order.priceListGroup) priceListCodes = order.priceListGroup.priceListCodes;
                            
                            tmpl.subscribe('OrderVariants', [reward.subTypeValue], order.stockLocationId, priceListCodes);
							break;
						case 'lineDiscount':
							let itemValue = getItemValueInOrder(order, reward.subtypeValue);
							discount = reward.value / itemValue * 100;

							_.each(order.items, function(item) {
								if (reward.subType == 'productVariant') {
									if (item.variantId == reward.subTypeValue)
										if (item.discount) {
											item.discount += discount;
										} else {
											item.discount = discount;
										}
								} else {
									//it is product line discount
									let productV = ProductVariants.findOne(item.variantId, { fields: { productId: 1 } });
									if (productV) {
										if (productV.productId == reward.subTypeValue)
											if (item.discount) {
												item.discount += discount;
											} else {
												item.discount = discount;
											}
									}
								}
							});
							break;
						case 'orderDiscount':
							discount = reward.value;
							if (order.discounts) {
								order.discounts += discount;
							} else {
								order.discounts = discount;
							}
							break;
						case 'shippingCost':
							break;
					}
				});
			}
		});
	} else {
		order.hasPromotions = false;
	}

	// record totals
	order.subTotal = numberize(tmpl.state.get('cSubTotal'));
	order.taxes = numberize(tmpl.state.get('cTaxes'));
	order.total = numberize(tmpl.state.get('cTotal'));
	return order;
}

function getItemValueInOrder(order, id) {
	let items = _.filter(order.items, function(item) {
		return item.variantId == id;
	});
	let value = 0;
	_.each(items, function(item) {
		value += item.quantity * item.price * (100 + item.taxRateOverride) / 100;
	})
	return value;
}
