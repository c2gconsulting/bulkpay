
/**
* TD Core Collections
* Maintain collections available from the main service
*
*/


/**
* Core transform collections
*
* transform methods used to return cart calculated values
* cartCount, cartSubTotal, cartShipping, cartTaxes, cartTotal
* are calculated by a transformation on the collection
* and are available to use in template as cart.xxx
* in template: {{cart.cartCount}}
* in code: Cart.findOne().cartTotal()
*/

/*
Core.Helpers.cartTransform = {
  cartCount: function () {
    let count = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        count += items.quantity;
      }
    }
    return count;
  },
  cartShipping: function () {
    let shippingTotal = 0;
    // loop through the cart.shipping, sum shipments.
    if (this.shipping) {
      for (let shipment of this.shipping) {
        shippingTotal += shipment.shipmentMethod.rate;
      }
    }
    return parseFloat(shippingTotal);
  },
  cartSubTotal: function () {
    let subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        subtotal += items.quantity * items.variants.price;
      }
    }
    subtotal = subtotal.toFixed(2);
    return subtotal;
  },
  cartTaxes: function () {
    let subtotal = 0;
    if (typeof this !== "undefined" && this !== null ? this.items : void 0) {
      for (let items of this.items) {
        let tax = this.tax || 0;
        subtotal += items.variants.price * tax;
      }
    }
    subtotal = subtotal.toFixed(2);
    return subtotal;
  },
  cartDiscounts: function () {
    return "0.00";
  },
  cartTotal: function () {
    let total;
    let subtotal = 0;
    let shippingTotal = 0;
    if (this.items) {
      for (let items of this.items) {
        subtotal += items.quantity * items.variants.price;
      }
    }
    // loop through the cart.shipping, sum shipments.
    if (this.shipping) {
      for (let shipment of this.shipping) {
        shippingTotal += shipment.shipmentMethod.rate;
      }
    }

    shippingTotal = parseFloat(shippingTotal);
    if (!isNaN(shippingTotal)) {
      subtotal = subtotal + shippingTotal;
    }
    total = subtotal.toFixed(2);
    return total;
  }
}; */

/**
* Core Collections Cart
*/
Carts = new Mongo.Collection("carts", {
  transform: function (cart) {
    let newInstance = Object.create(Core.Helpers.cartTransform);
    return _.extend(newInstance, cart);
  }
});
Partitioner.partitionCollection(Carts, {index: {userId: 1}});

Carts.attachSchema(Core.Schemas.Cart);

/**
* Core Collections Orders
*/
Orders = new Mongo.Collection("orders", {
  transform: function (order) {
    order.itemCount = function () {
      let count = 0;
      if (order !== null ? order.items : void 0) {
        for (let items of order.items) {
          count += items.quantity;
        }
      }
      return count;
    };
    order.openItemCount = function () {
      let count = 0;
      if (order !== null ? order.items : void 0) {
        for (let items of order.items) {
          if (items.status === "open") count += items.quantity;
        }
      }
      return count;
    };
    order.rawTotal = function () {
      let total = 0;
      if (order !== null ? order.items : void 0) {
        _.each(order.items, function(item) {
          let d = item.discount || 0;
          if (!item.isPromo && item.status !== 'deleted') {
            total += ((item.quantity * item.price * ((100 - d)/100)));
          }
        });
      }
      return total;
    };
    order.shippedItemCount = function () {
      let count = 0;
      if (order !== null ? order.items : void 0) {
        for (let items of order.items) {
          if (items.status === "shipped") count += items.quantity;
        }
      }
      return count;
    };
    order.salesLocation = function() {
      let location = '';
      if (order !== null ? order.salesLocationId : void 0) {
        let locations = Locations.findOne(order.salesLocationId);
        if (locations) location = locations.name;
      }
      return location;
    };
    order.stockLocation = function() {
      let location = '';
      if (order !== null ? order.stockLocationId : void 0) {
        let locations = Locations.findOne(order.stockLocationId);
        if (locations) location = locations.name;
      }
      return location;
    };
    order.payments = function() {
      let payments = 0;
      if (order !== null) {
        let cPayments = Payments.find({ orderId: order._id}).fetch();
        _.each(cPayments, function(p) {
          payments += p.amount;
        });
      }
      return payments;
    };
    order.nonCashPayments = function() {
      let payments = 0;
      if (order !== null) {
        let cPayments = Payments.find({ orderId: order._id, isCashInHand: false }).fetch();
        _.each(cPayments, function(p) {
          payments += p.amount;
        });
      }
      return payments;
    }();
    order.cashPayments = function() {
      let payments = 0;
      if (order !== null) {
        let cPayments = Payments.find({ orderId: order._id, isCashInHand: true }).fetch();
        _.each(cPayments, function(p) {
          payments += p.amount;
        });
      }
      return payments;
    }();
    order.balance = function() {
      return order.total - (order.appliedCredits + order.payments())
    };
    return order;
  }
});
Partitioner.partitionCollection(Orders, {index: {userId: 1}});
Orders.attachSchema(Core.Schemas.Order);

/**
* Core Collections OrderTypes
*/
OrderTypes = new Mongo.Collection("ordertypes");
Partitioner.partitionCollection(OrderTypes);
OrderTypes.attachSchema(Core.Schemas.OrderType);

/**
* Core Collections Shipments
*/
Shipments = new Mongo.Collection("shipments");
Partitioner.partitionCollection(Shipments);
Shipments.attachSchema(Core.Schemas.Shipment);

/**
* Core Collections Invoices
*/
Invoices = new Mongo.Collection("invoices");
Partitioner.partitionCollection(Invoices);
Invoices.attachSchema(Core.Schemas.Invoice);

/**
* Core Collections Payments
*/
Payments = new Mongo.Collection("payments");
Partitioner.partitionCollection(Payments);
Payments.attachSchema(Core.Schemas.Payment);

/**
* Core Collections Taxes
*/
Taxes = new Mongo.Collection("taxes");
Taxes.attachSchema(Core.Schemas.Tax);


/**
* Core Collections Tenants
*/
Tenants = new Mongo.Collection("tenants");
Tenants.attachSchema(Core.Schemas.Tenant);

/**
* Core Collections Translations
*/
Translations = new Mongo.Collection("translations");
Translations.attachSchema(Core.Schemas.Translation);


/**
* Core Collections Products
*/
Products = new Mongo.Collection("products");
Partitioner.partitionCollection(Products, {index: {handle: 1}});
Products.attachSchema(Core.Schemas.Product);


/**
* Core Collections PriceListGroups
*/
PriceListGroups = new Mongo.Collection("pricelistgroups",  {
  transform: function(pricelistgroup) {
    if (pricelistgroup) {
      pricelistgroup.priceListCodes = function(){
        let dateUtc = moment.utc(new Date);
        let localDate = moment(dateUtc).local();
        let today = localDate._i
        let prices = pricelistgroup.priceLists;
        let availablePrices = _.filter(prices, function(a){return a.startDate <= today && a.endDate >= today});
        return _.pluck(availablePrices, 'code');
      }();
    }
    return pricelistgroup;
  }
});
Partitioner.partitionCollection(PriceListGroups);
PriceListGroups.attachSchema(Core.Schemas.PriceListGroup);


/**
* Core Collections ProductVariants
*/
ProductVariants = new Mongo.Collection("productvariants");
Partitioner.partitionCollection(ProductVariants, {index: {code: 1}});
ProductVariants.attachSchema(Core.Schemas.ProductVariant);

/**
* Core Collections Discounts
*/
Discounts = new Mongo.Collection("discounts");
Partitioner.partitionCollection(Discounts);
Discounts.attachSchema(Core.Schemas.Discount);


/**
* Core Collections Customers
*/
Customers = new Mongo.Collection("customers", {
  transform: function(customer) {
    if (customer && customer.account) {
      customer.account.availableBalance = function(){
        let availableBalance = 0;
        availableBalance = customer.account.currentBalance;
        let holds = CustomerHolds.find({customerId: customer._id}).fetch();
        _.each(holds, function(hold) {
          if (hold && _.isNumber(hold.amount)) availableBalance -= hold.amount;
        });
        return _.isNumber(availableBalance) ? availableBalance : 0;
      }();
      customer.availableCreditLimit = function(){
        let availableCreditLimit = 0;
        availableCreditLimit = _.isNumber(customer.account.remainingCreditLimit) ? customer.account.remainingCreditLimit : 0;
        let holds = CreditHolds.find({customerId: customer._id}).fetch();
        _.each(holds, function(hold) {
          if (hold && _.isNumber(hold.amount)) availableCreditLimit -= hold.amount;
        });
        return _.isNumber(availableCreditLimit) && availableCreditLimit > 0 ? availableCreditLimit : 0;
      }();
    }
    return customer;
  }
});
Partitioner.partitionCollection(Customers);
Customers.attachSchema(Core.Schemas.Customer);


/**
 * Core Collections Suppliers
 */
Suppliers = new Mongo.Collection("suppliers");
Partitioner.partitionCollection(Suppliers);
Suppliers.attachSchema(Core.Schemas.Supplier);


/**
 * Core Collections Customers
 */
CustomerTransactions = new Mongo.Collection("customertransactions");
Partitioner.partitionCollection(CustomerTransactions);
CustomerTransactions.attachSchema(Core.Schemas.CustomerTransaction);


/**
* Core Collections Locations
*/
Locations = new Mongo.Collection("locations");
Partitioner.partitionCollection(Locations);
Locations.attachSchema(Core.Schemas.Location);

/**
* Core Collections ReturnOrders
*/
ReturnOrders = new Mongo.Collection("returnorders");
Partitioner.partitionCollection(ReturnOrders, {index: {userId: 1}});
ReturnOrders.attachSchema(Core.Schemas.ReturnOrder);

/**
 * Core Collections CustomerGroups
*/
CustomerGroups = new Mongo.Collection("customergroups");
Partitioner.partitionCollection(CustomerGroups);
CustomerGroups.attachSchema(Core.Schemas.CustomerGroup);


/**
 * Core Collections CustomerHolds
*/
CustomerHolds = new Mongo.Collection("customerholds");
Partitioner.partitionCollection(CustomerHolds, {index: {customerId: 1}});
CustomerHolds.attachSchema(Core.Schemas.CustomerHold);

/**
 * Core Collections Brands
 */
Brands = new Mongo.Collection("brands");
Partitioner.partitionCollection(Brands);
Brands.attachSchema(Core.Schemas.Brand);


/**
 * Core Collections ReturnReasons
 */
ReturnReasons = new Mongo.Collection("returnreasons");
Partitioner.partitionCollection(ReturnReasons);
ReturnReasons.attachSchema(Core.Schemas.ReturnReason);

/**
 * Core Collections SalesAreas
 */
SalesAreas = new Mongo.Collection("salesareas");
Partitioner.partitionCollection(SalesAreas);
SalesAreas.attachSchema(Core.Schemas.SalesArea);


/**
 * Core Collections Approvals
 */
Approvals = new Mongo.Collection("approvals");
Partitioner.partitionCollection(Approvals);
Approvals.attachSchema(Core.Schemas.Approval);

/**
 * Core Collections Promotions
 */
ApprovalParameters = new Mongo.Collection("approvalparameters");
Partitioner.partitionCollection(ApprovalParameters);
ApprovalParameters.attachSchema(Core.Schemas.ApprovalParamater);

/**
 * Core Collections CreditHolds
 */
CreditHolds = new Mongo.Collection("creditholds");
Partitioner.partitionCollection(CreditHolds, {index: {customerId: 1}});
CreditHolds.attachSchema(Core.Schemas.CreditHold);

/**
 * Core Collections PaymentMethods
 */
PaymentMethods = new Mongo.Collection("paymentmethods");
Partitioner.partitionCollection(PaymentMethods);
PaymentMethods.attachSchema(Core.Schemas.PaymentMethod);

/**
 * Core Collections Promotions
 */
Promotions = new Mongo.Collection("promotions");
Partitioner.partitionCollection(Promotions);
Promotions.attachSchema(Core.Schemas.Promotion);

/** 
 * Core Collections Promotions Parameters
 */
PromotionParameters = new Mongo.Collection("promotionparameters");
Partitioner.partitionCollection(PromotionParameters);
PromotionParameters.attachSchema(Core.Schemas.PromotionParameter);

/** 
 * Core Collections Promotions Reward Parameters
 */
PromotionRewardParameters = new Mongo.Collection("promotionrewardparameters");
Partitioner.partitionCollection(PromotionRewardParameters);
PromotionRewardParameters.attachSchema(Core.Schemas.PromotionRewardParameter);

/** 
 * Core Collections Promotions Reward SubTypes
 */
PromotionRewardSubTypes = new Mongo.Collection("promotionrewardsubtypes");
Partitioner.partitionCollection(PromotionRewardSubTypes);
PromotionRewardSubTypes.attachSchema(Core.Schemas.PromotionRewardSubType);


/**
 * Core Collections Promotions Rebate
 */
PromotionRebates = new Mongo.Collection("promotionrebates");
Partitioner.partitionCollection(PromotionRebates);
PromotionRebates.attachSchema(Core.Schemas.PromotionRebate);


/**
 * Core Collections Webhooks
 */
WebHooks = new Mongo.Collection("webhooks");
Partitioner.partitionCollection(WebHooks);
WebHooks.attachSchema(Core.Schemas.WebHook);

/**
 * Core Collections Webhooks
 */
DocumentNumbers = new Mongo.Collection("documentnumbers");
Partitioner.partitionCollection(DocumentNumbers);
DocumentNumbers.attachSchema(Core.Schemas.DocumentNumber);

/**
 * Core Collections Companies
 */
Companies = new Mongo.Collection("companies");
Companies.attachSchema(Core.Schemas.Company);

/**
 * Core Collections PurchaseOrder
 */
PurchaseOrders = new Mongo.Collection("purchaseorders");
Partitioner.partitionCollection(PurchaseOrders);
PurchaseOrders.attachSchema(Core.Schemas.PurchaseOrder);

/**
 * Core Collections StockTransfer
 */
StockTransfers = new Mongo.Collection("stocktransfers");
Partitioner.partitionCollection(StockTransfers);
StockTransfers.attachSchema(Core.Schemas.StockTransfer);

/**
 * Core Collections StockTransfer
 */
StockAdjustments = new Mongo.Collection("stockadjustments");
Partitioner.partitionCollection(StockAdjustments);
StockAdjustments.attachSchema(Core.Schemas.StockAdjustment);
