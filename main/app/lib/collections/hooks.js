/**
 * Core Collection Hooks
 * transform collections based on events
 *
 * See: https://github.com/matb33/meteor-collection-hooks
 */

let applyVariantDefaults;
let organizedChildVariants;

/**
 * applyVariantDefaults
 *
 * helper function to set defaults for Hooks
 * is how the actual defaults for variants are set
 * @param {Object} variant - applys default varent structure
 * @return {Object} returns new variant object
 */
applyVariantDefaults = function (variant) {
  return _.defaults(variant, {
    _id: Random.id(),
    inventoryManagement: true,
    inventoryPolicy: true,
    updatedAt: new Date,
    createdAt: new Date()
  });
};

/**
 * organizedChildVariants
 * helper that gives us a few organized objects of child variants organized
 * by parentId.
 * returns an object that contains the following
 *   children: object with arrays of all children for each parent
 *   variantChildren: object with arrays of all children that are not type 'inventory' for each parent
 *   inventoryChildren: object arrays of all children that are type inventory for each parent
 * @param {Object} product - product object
 * @return {Object} child variant hierarchy
 */
organizedChildVariants = function (product) {
  let children = {};
  let inventoryChildren = {};
  let variantChildren = {};
  let currentVariant = product.variants[0];
  let i = 0;
  while (i < product.variants.length) {
    currentVariant = product.variants[i];
    // If currentVariant's parentId matches variant._id, it's a child
    if (currentVariant.parentId) {
      if (!children[currentVariant.parentId]) {
        children[currentVariant.parentId] = [];
      }
      children[currentVariant.parentId].push(currentVariant);
      // if currentVariant's type is 'inventory' it's an inventory variant
      // Otherwise it's a standard variant that could have children of it's own.
      if (currentVariant.type === "inventory") {
        if (!inventoryChildren[currentVariant.parentId]) {
          inventoryChildren[currentVariant.parentId] = [];
        }
        inventoryChildren[currentVariant.parentId].push(currentVariant);
      } else {
        if (!variantChildren[currentVariant.parentId]) {
          variantChildren[currentVariant.parentId] = [];
        }
        variantChildren[currentVariant.parentId].push(currentVariant);
      }
    }
    i++;
  }
  return {
    children: children,
    variantChildren: variantChildren,
    inventoryChildren: inventoryChildren
  };
};

/*
 * refresh mail configuration on package change
 *//*
Packages.after.update(function (userId, doc,
  fieldNames, modifier) {
  let _ref;
  let _ref1;
  let _ref2;
  if (((_ref = modifier.$set) !== null ? (_ref1 = _ref.settings) != null ?
      _ref1.mail : void 0 : void 0) || ((_ref2 = modifier.$set) != null ?
      _ref2["settings.mail.user"] : void 0)) {
    if (Meteor.isServer) {
      return Core.configureMailUrl();
    }
  }
});

/*

/**
 * create unpublished product with a default variant
 *//*
Products.before.insert(function (userId, product) {
  _.defaults(product, {
    type: "simple",
    handle: getSlug(product.title || ""),
    isVisible: false,
    updatedAt: new Date,
    createdAt: new Date()
  });
  const results = [];
  for (let variant of product.variants) {
    results.push(applyVariantDefaults(variant));
  }
  return results;
});

/**
 * On product update
 *//*
Products.before.update(function (userId, product,
  fieldNames, modifier, options) {
  let addToSet, createdAt, differenceInQty, firstInventoryVariant,
    organizedChildren, originalInventoryQuantity, position, removedVariant,
    removedVariantId, runningQty, updatedAt, updatedInventoryQuantity,
    updatedVariant, updatedVariantId, variant, _ref, _ref1, _ref10, _ref11,
    _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2,
    _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
  ({
    updatedAt: new Date()
  });
  if (modifier.$push) {
    if (modifier.$push.variants) {
      applyVariantDefaults(modifier.$push.variants);
    }
  }

  //
  // Keep Parent/Grandparent/etc data in sync as their child variants get updated
  //
  // Finds any modifier that:
  // sets the inventory quantity of variants,
  // adds one or more 'inventory' type to the product's set of variants,
  // or pulls a variant from the set.
  //

  if (((_ref = modifier.$set) != null ? (_ref1 = _ref["variants.$"]) !=
      null ? _ref1.inventoryQuantity : void 0 : void 0) >= 0 || ((_ref2 =
        modifier.$addToSet) != null ? (_ref3 = _ref2.variants) != null ? (
        _ref4 = _ref3.$each) != null ? _ref4[0].type : void 0 : void 0 :
      void 0) === "inventory" || ((_ref5 = modifier.$addToSet) != null ? (
      _ref6 = _ref5.variants) != null ? _ref6.type : void 0 : void 0) ===
    "inventory" || ((_ref7 = modifier.$pull) != null ? (_ref8 = _ref7.variants) !=
      null ? _ref8._id : void 0 : void 0)) {
    organizedChildren = organizedChildVariants(product);
    if ((_ref9 = modifier.$set) != null ? _ref9["variants.$"] : void 0) {
      updatedVariantId = modifier.$set["variants.$"]._id;
      updatedVariant = modifier.$set["variants.$"];
      updatedInventoryQuantity = modifier.$set["variants.$"].inventoryQuantity;
      originalInventoryQuantity = ((function () {
        let _i, _len, _ref10, _results;
        _ref10 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref10.length; _i < _len; _i++) {
          variant = _ref10[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0].inventoryQuantity || 0;
      differenceInQty = updatedInventoryQuantity -
        originalInventoryQuantity;
    } else if ((_ref10 = modifier.$pull) != null ? (_ref11 = _ref10.variants) !=
      null ? _ref11._id : void 0 : void 0) {
      removedVariantId = modifier.$pull["variants"]._id;
      removedVariant = ((function () {
        let _i, _len, _ref12, _results;
        _ref12 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref12.length; _i < _len; _i++) {
          variant = _ref12[_i];
          if (variant._id === removedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      if (removedVariant.parentId) {
        updatedVariantId = removedVariant.parentId;
        updatedVariant = ((function () {
          let _i, _len, _ref12, _results;
          _ref12 = product.variants;
          _results = [];
          for (_i = 0, _len = _ref12.length; _i < _len; _i++) {
            variant = _ref12[_i];
            if (variant._id === updatedVariantId) {
              _results.push(variant);
            }
          }
          return _results;
        })())[0];
        if (removedVariant.inventoryQuantity) {
          differenceInQty = -removedVariant.inventoryQuantity;
        } else {
          differenceInQty = -1;
        }
      } else {
        updatedVariant = {
          parentId: null
        };
        updatedVariantId = null;
        differenceInQty = null;
      }
    } else if (((_ref12 = modifier.$addToSet) != null ? (_ref13 = _ref12.variants) !=
        null ? _ref13.type : void 0 : void 0) === "inventory") {
      updatedVariantId = modifier.$addToSet["variants"].parentId;
      updatedVariant = ((function () {
        let _i, _len, _ref14, _results;
        _ref14 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref14.length; _i < _len; _i++) {
          variant = _ref14[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      differenceInQty = 1;
      firstInventoryVariant = ((function () {
        let _i, _len, _ref14, _results;
        _ref14 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref14.length; _i < _len; _i++) {
          variant = _ref14[_i];
          if (variant.parentId === updatedVariantId && variant.type ===
            "inventory") {
            _results.push(variant);
          }
        }
        return _results;
      })()).length === 0;
      if (firstInventoryVariant) {
        differenceInQty = 1 - updatedVariant.inventoryQuantity;
      }
    } else if ((_ref14 = modifier.$addToSet) != null ? (_ref15 = _ref14.variants) !=
      null ? _ref15.$each[0].type = "inventory" : void 0 : void 0) {
      updatedVariantId = modifier.$addToSet["variants"].$each[0].parentId;
      updatedVariant = ((function () {
        let _i, _len, _ref16, _results;
        _ref16 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref16.length; _i < _len; _i++) {
          variant = _ref16[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
      differenceInQty = modifier.$addToSet["variants"].$each.length;
      firstInventoryVariant = ((function () {
        let _i, _len, _ref16, _results;
        _ref16 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref16.length; _i < _len; _i++) {
          variant = _ref16[_i];
          if (variant.parentId === updatedVariantId && variant.type ===
            "inventory") {
            _results.push(variant);
          }
        }
        return _results;
      })()).length === 0;
      if (firstInventoryVariant && updatedVariant.inventoryQuantity) {
        differenceInQty = differenceInQty - updatedVariant.inventoryQuantity;
      }
    }
    while (true) {
      if (!updatedVariantId) {
        break;
      }
      runningQty = 0;
      if (((_ref16 = organizedChildren.variantChildren[updatedVariantId]) !=
          null ? _ref16.constructor : void 0) === Array) {
        runningQty += organizedChildren.variantChildren[updatedVariantId].reduce(
          (function (total, child) {
            return total + (child.inventoryQuantity || 0);
          }), 0);
      }
      if ((_ref17 = organizedChildren.inventoryChildren[updatedVariantId]) !=
        null ? _ref17.length : void 0) {
        runningQty += organizedChildren.inventoryChildren[updatedVariantId]
          .length;
      }
      if (differenceInQty) {
        runningQty += differenceInQty;
      }
      if (!organizedChildren.children[updatedVariantId]) {
        runningQty += updatedVariant.inventoryQuantity || 0;
      }
      Products.direct.update({
        "_id": product._id,
        "variants._id": updatedVariantId
      }, {
        $set: {
          "variants.$.inventoryQuantity": runningQty
        }
      });
      if (!updatedVariant.parentId) {
        break;
      }
      updatedVariantId = updatedVariant.parentId;
      updatedVariant = ((function () {
        let _i, _len, _ref18, _results;
        _ref18 = product.variants;
        _results = [];
        for (_i = 0, _len = _ref18.length; _i < _len; _i++) {
          variant = _ref18[_i];
          if (variant._id === updatedVariantId) {
            _results.push(variant);
          }
        }
        return _results;
      })())[0];
    }
  }
  if (_.indexOf(fieldNames, "positions") !== -1) {
    addToSet = (_ref18 = modifier.$addToSet) != null ? _ref18.positions :
      void 0;
    if (addToSet) {
      createdAt = new Date();
      updatedAt = new Date();
      if (addToSet.$each) {
        for (position in addToSet.$each) {
          createdAt = new Date();
          updatedAt = new Date();
        }
      } else {
        addToSet.updatedAt = updatedAt;
      }
    }
  }
  if (modifier.$set) {
    modifier.$set.updatedAt = new Date();
  }
  if ((_ref19 = modifier.$addToSet) != null ? _ref19.variants : void 0) {
    if (!modifier.$addToSet.variants.createdAt) {
      modifier.$addToSet.variants.createdAt = new Date();
    }
    if (!modifier.$addToSet.variants.updatedAt) {
      return modifier.$addToSet.variants.updatedAt = new Date();
    }
  }-
});
*/

CustomerTransactions.before.insert(function (userId, doc) {
  var currencies = EJSON.parse(Assets.getText("settings/currencies.json"));
  doc.currency.symbol = currencies[doc.currency.iso].symbol;
});

Orders.after.update(function (userId, doc) {
  let oldDoc = this.previous;
  let oldAppliedCredits = oldDoc.appliedCredits;
  let newAppliedCredits = doc.appliedCredits;
  let diff = oldAppliedCredits - newAppliedCredits;
  if (doc.status == "open"  && diff !== 0 ){
    let customerHold = CustomerHolds.findOne({orderId: doc._id});
    if (customerHold){
      let holdAmount =  customerHold.amount - diff;
      CustomerHolds.update(customerHold._id, {$set: {amount: holdAmount}});
      Core.Log.info(`[Orders.after.update] CustomerHolds amount set for change in appliedCredits on open order ${doc.orderNumber}`);
    } else {
      let holdDoc = {};
      holdDoc.customerId = doc.customerId;
      holdDoc.orderId = doc._id;
      holdDoc.amount = doc.appliedCredits;
      holdDoc.currency = doc.currency;
      CustomerHolds.insert(holdDoc);
      Core.Log.info(`[Orders.after.update] CustomerHolds amount set for new appliedCredits on open order ${doc.orderNumber}`);
    }
  }

  if (doc.status === "cancelled" ){
    let customerHold = CustomerHolds.findOne({orderId: doc._id});
    if (customerHold){
      CustomerHolds.remove(customerHold._id);
      Core.Log.info(`[Orders.after.update] CustomerHolds removed for cancelled order ${doc.orderNumber}`);
    }
    let creditHold = CreditHolds.findOne({orderId: doc._id});
    if (creditHold){
      CreditHolds.remove(creditHold._id);
      Core.Log.info(`[Orders.after.update] CreditHolds removed for cancelled order ${doc.orderNumber}`);
    }
  }
  if (doc.status !== "cancelled"){
    let allDeleted = _.every(doc.items, function(item) {return item.status === "deleted" });
    if (allDeleted){
      Orders.update({_id: doc._id}, {$set: {status: "cancelled"}});
      Core.Log.info(`[Orders.after.update] Order status set to cancelled for all items deleted on order ${doc.orderNumber}`);
    }
  }

  orderPayments = function() {
    let payments = 0;
    let cPayments = Payments.find({ orderId: doc._id}).fetch();
    _.each(cPayments, function(p) {
      payments += p.amount;
    });
    return payments;
  };


  let unclear = false;
  if (doc.paymentStatus !== "unpaid"){
    let appliedCredits = doc.appliedCredits || 0;
    let payments = orderPayments();
    let totalPayments = appliedCredits + payments;

    if (totalPayments === 0) {
      unclear = true;
      Orders.update({_id: doc._id}, {$set: {paymentStatus: "unpaid"}});
      Core.Log.info(`[Orders.after.update] Order paymentStatus set to unpaid for order ${doc.orderNumber}`);
    }
  }

  if (doc.paymentStatus !== "partial"){
    let appliedCredits = doc.appliedCredits || 0;
    let payments = orderPayments();
    let totalPayments = appliedCredits + payments;

    if (totalPayments > 0 && totalPayments < doc.total) {
      unclear = true;
      Orders.update({_id: doc._id}, {$set: {paymentStatus: "partial"}});
      Core.Log.info(`[Orders.after.update] Order paymentStatus set to partial for order ${doc.orderNumber}`);
    }
  }

  if (doc.paymentStatus !== "paid"){
    let appliedCredits = doc.appliedCredits || 0;
    let payments = orderPayments();
    let totalPayments = appliedCredits + payments;

    if (totalPayments >= doc.total && totalPayments > 0) {
      Orders.update({_id: doc._id}, {$set: {paymentStatus: "paid", isCleared: true}});
      Core.Log.info(`[Orders.after.update] Order paymentStatus set to paid and isCleared set for order ${doc.orderNumber}`);
    }
  }

  // add code for credit check

  if (unclear && doc.isCleared === true) {
    Orders.update({_id: doc._id}, {$set: {isCleared: false}});
    Core.Log.info(`[Orders.after.update] Order isCleared unset for order ${doc.orderNumber} with unpaid or partial paymentStatus`);
  }

  if (doc.status === "accepted" && !doc.isCleared){
    Orders.update({_id: doc._id}, {$set: {status: "open"}});
    Core.Log.info(`[Orders.after.update] Order status reset to open for order ${doc.orderNumber} with isCleared not set`);
  }

  if (doc.status === "accepted" && !doc.isApproved){
    Orders.update({_id: doc._id}, {$set: {status: "open"}});
    Core.Log.info(`[Orders.after.update] Order status reset to open for order ${doc.orderNumber} with isApproved not set`);
  }

  if (doc.status !== "shipped" && oldDoc.status !== 'shipped' && doc.status !== "cancelled"){
    let hasShippedItems = _.some(doc.items, function(item) {return item.status === "shipped" });
    if (hasShippedItems) {
      Orders.update({_id: doc._id}, {$set: {status: "shipped", shippingStatus: "shipped"}});
      Core.Log.info(`[Orders.after.update] Order status set to shipped for order ${doc.orderNumber} with shipped items`);
    }
  }

  if (doc.status === "open" && !doc.isCleared && doc.total === 0){
    Orders.update({_id: doc._id}, {$set: {isCleared: true}});
    Core.Log.info(`[Orders.after.update] Order set to cleared for order ${doc.orderNumber} with zero value`);
  }

  if (doc.status === "open"){
    let creditHolds = CreditHolds.findOne({orderId: doc._id});
    if (creditHolds){
      CreditHolds.remove(creditHolds._id);
    }
    
    let customer = Customers.findOne(doc.customerId);
    if (doc.appliedCredits < doc.total){
      let order = Orders.findOne(doc._id);
      if (customer){
        let availableCreditLimit = customer.availableCreditLimit;
        let orderBalance = order.balance();
        if (availableCreditLimit && availableCreditLimit >= orderBalance && orderBalance >= 0){
          let holdDoc = {};
          holdDoc.customerId = doc.customerId;
          holdDoc.orderId = doc._id;
          holdDoc.amount = orderBalance;
          holdDoc.currency = doc.currency;
          CreditHolds.insert(holdDoc);
          if (!order.isCleared) {
            Orders.update(order._id, {$set: {isCleared: true}});
            Core.Log.info(`[Orders.after.update] Order set to cleared for order ${doc.orderNumber} with available credit limit`);
          }
          Core.Log.info(`[Orders.after.update] Order credit hold reviewed to ${holdDoc.amount} for order ${doc.orderNumber} with available credit limit: ${availableCreditLimit}`);
        } else if (orderBalance > 0) {
          if (order.isCleared) Orders.update(order._id, {$set: {isCleared: false}});
          Core.Log.info(`[Orders.after.update] Order set to not cleared for order ${doc.orderNumber} without available credit limit`);
        }
      }
    }
  }


  let subTotal = function() {
    let tenantUserId = userId || doc.userId;
    let items = doc.items;
    let discount =  doc.discounts || 0;
    let shippingCosts = doc.shippingCosts || 0;
    let subTotal = 0;
    _.each(items, function(item) {
      let d = item.discount || 0;
      if (!item.isPromo && item.status !== 'deleted') {
        subTotal += ((item.quantity * item.price * ((100 - d)/100)));
      }
    });
    let currency = doc.currency;
    return Core.roundMoney((subTotal + shippingCosts - discount), currency["iso"], tenantUserId);
  }();

  let taxes = function() {
    let tenantUserId = userId || doc.userId;
    let items = doc.items;
    let discount = doc.discounts || 0;
    let shippingCosts = doc.shippingCosts || 0;
    let taxes = 0;
    let subTotal = 0;
    let defaultTaxRate = doc.taxRate || 0;
    _.each(items, function(item) {
      let d = item.discount || 0;
      let tax = _.isUndefined(item.taxRateOverride) ? defaultTaxRate : item.taxRateOverride;
      if (!item.isPromo && item.status !== 'deleted') {
        subTotal += ((item.quantity * item.price * ((100 - d)/100)));
        taxes += ((item.quantity * item.price * ((100 - d)/100))) * (tax/100);
      }
    });
    let effectiveTaxRate = subTotal ? taxes / subTotal : 0;
    let currency = doc.currency;
    return Core.roundMoney((taxes + ((shippingCosts - discount) * effectiveTaxRate)), currency["iso"], tenantUserId)
  }();

  let total = function() {
    return subTotal + taxes
  }();


  if (doc.status === "open" && this.previous.total !== total){
    Orders.update(doc._id, {$set: {total: total, subTotal: subTotal, taxes: taxes}});
    Core.Log.info(`[Orders.after.update] Order totals and taxes recomputed and set for order ${doc.orderNumber}`);
  }

  if (doc.status === "open" && doc.isApproved && doc.isCleared){
    Orders.update({_id: doc._id}, {$set: {status: "accepted"}});
    Core.Log.info(`[Orders.after.update] Order status set to accepted for order ${doc.orderNumber} that isCleared and isApproved`);
    sendNotification("order.status.updated", doc._id, doc.userId, oldDoc._groupId);
  }

  if (doc.status === "accepted"){
    let creditHold = CreditHolds.findOne({orderId: doc._id});
    if (creditHold){
      CreditHolds.remove(creditHold._id);
      Core.Log.info(`[Orders.after.update] CreditHolds removed for accepted order ${doc.orderNumber}`);
    }
  }

  // Apply rebates if order status is shipped
  if (doc.status === "shipped") {
    let hasShippedItems = _.filter(doc.items, function(item) {
      return item.status === "shipped";
    });
    if (!_.isEmpty(hasShippedItems)) {
      
      doc.items = hasShippedItems;

      Meteor.call('promotions/applyRulesToOrder', doc, function(err, promotions) {
        if (err) {
          Core.Log.error(`An error occured: ${err}`);
        } else {
          if (promotions) {
            _.each(promotions, function(promotion) {
              /*
               * @Todo
               * resolve conflicts on promotions
               * promotion.exclusive [false, true]
               * promotion.priority [low, normal, high]
               */

              //resolve currency clashes
              if (promotion.currency === doc.currency.iso) {
                _.each(promotion.rewards, function(reward) {
                  if (reward.type === 'rebates') {
                    //insert a rebate into the rebates collection
                    let rebate = {
                      promotionId: promotion._id,
                      type: reward.subType,
                      customerId: doc.customerId,
                      value: reward.value,
                      currency: promotion.currency,
                      orderId: doc._id,
                      createdBy: doc.createdBy
                    };
                    let r = PromotionRebates.findOne({promotionId: rebate.promotionId, orderId: rebate.orderId});
                    if(!r) {
                      var pRebate = PromotionRebates.insert(rebate);
                      sendNotification("rebate.created", pRebate, doc.userId, oldDoc._groupId)
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
  }

});

Orders.after.insert(function (userId, doc) {
  if (doc.appliedCredits > 0){
      let holdDoc = {};
      holdDoc.customerId = doc.customerId;
      holdDoc.orderId = doc._id;
      holdDoc.amount = doc.appliedCredits;
      holdDoc.currency = doc.currency;
      CustomerHolds.insert(holdDoc);
  }
  
  if (doc.status === "open" && !doc.isCleared && doc.total === 0){
    Orders.update({_id: doc._id}, {$set: {isCleared: true}});
    Core.Log.info(`[Orders.after.insert] Order set to cleared for order ${doc.orderNumber} with zero value`);
  }

  if (doc.appliedCredits < doc.total){
    let customer = Customers.findOne(doc.customerId);
    let order = Orders.findOne({orderNumber: doc.orderNumber});
    let orderBalance = order.balance();
    if (customer){
      let availableCreditLimit = customer.availableCreditLimit;
      if (availableCreditLimit && availableCreditLimit >= orderBalance){
        let holdDoc = {};
        holdDoc.customerId = doc.customerId;
        holdDoc.orderId = doc._id;
        holdDoc.currency = doc.currency;
        holdDoc.amount = orderBalance;
        CreditHolds.insert(holdDoc);
        Orders.update({orderNumber: doc.orderNumber}, {$set: {isCleared: true}});
        Core.Log.info(`[Orders.after.insert] Order credit check completed, order ${doc.orderNumber} cleared`);
      }
    }
  }
});

Orders.before.insert(function (userId, doc) {
  let approvalDoc = doc.hasPromotions && doc.rawOrder ? JSON.parse(doc.rawOrder) : doc;
  Meteor.call("approvals/applyRulesToOrder", approvalDoc, "Order", function(err, result) {
    if (err) {
      Core.Log.error(`Cannot process Approval Rules: ${err}`);
    } else {
      if (result){
        doc.approvalStatus = "pending";
        doc.isApproved = false;
      } else {
        doc.isApproved = true;
        doc.approvalStatus = "approved";
        doc.approvals = [{approvedAt: new Date, isAutoApproved: true}];
        doc.history.push({event: "AUTO_APPROVAL", userId: doc.userId, createdAt: new Date});
        if (doc.isCleared) {
          doc.status = "accepted";
          doc.history.push({event: "STATUS_CHANGE", newValue: "accepted", userId: doc.userId, createdAt: new Date});
        }
        
      }
      Core.Log.info(`[Orders.before.insert] Approval Rules processed, approval required: ${result}`);
      if (!result && doc.isCleared) Core.Log.info(`[Orders.before.insert] Order set to accepted for order ${doc.orderNumber}`);
    }
  });
  
});

Orders.before.update(function (userId, doc, fieldNames, modifier, options) {
  let approvalDoc = doc.hasPromotions && doc.rawOrder ? JSON.parse(doc.rawOrder) : doc;
  if (modifier.$set.approvalStatus === "pending") {
    Meteor.call("approvals/applyRulesToOrder", approvalDoc, "Order", function(err, result) {
      if (err) {
        Core.Log.error(`Cannot process Approval Rules: ${err}`);
      } else {
        modifier.$set = modifier.$set || {};
        if (result){
          modifier.$set.approvalStatus = "pending";
          modifier.$set.isApproved = false;
        } else {
          modifier.$set.isApproved = true;
          modifier.$set.approvalStatus = "approved";
          modifier.$set.approvals = [{approvedAt: new Date, isAutoApproved: true}];
          modifier.$push.history = {event: "AUTO_APPROVAL", userId: doc.userId, createdAt: new Date};
        }
        Core.Log.info(`[Orders.before.update] Approval Rules re-processed for order ${doc.orderNumber}, approval required: ${result}`);
      }
    });
  }
  
});

ReturnOrders.before.insert(function (userId, doc) {
  Meteor.call("approvals/applyRulesToOrder", doc, "ReturnOrder", function(err, result) {
    if (err) {
      Core.Log.error(`Cannot process Approval Rules: ${err}`);
    } else {
      if (result){
        doc.status = "pending";
        doc.isApproved = false;
      } else {
        doc.isApproved = true;
        doc.status = "approved";
        doc.approvals = [{approvedAt: new Date, isAutoApproved: true}];
        doc.history.push({event: "AUTO_APPROVAL", userId: doc.userId, createdAt: new Date});
      }
      Core.Log.info(`[ReturnOrders.before.insert] Approval Rules processed, approval required: ${result}`);
    }
  });

});

CustomerTransactions.after.insert(function (userId, doc) {
  if (doc.transactionType == "invoices"){
    let amount1 = (90/100) * doc.amount;
    let amount2 = (110/100) * doc.amount;
    let invoice = Invoices.findOne({invoiceNumber: Number(doc.reference)});
    if (invoice && invoice.orderId && invoice.customerId === doc.customerId
        && (amount1 < invoice.total && invoice.total < amount2)){
      let order = Orders.findOne(invoice.orderId);
      if (order){
        let hold = CustomerHolds.findOne({orderId: order._id});
        if (hold){
          if (doc.amount >= hold.amount){
            CustomerHolds.remove(hold._id)
          }else {
            let holdAmount =  hold.amount - doc.amount;
            CustomerHolds.update(hold._id, {$set: {amount: holdAmount}})
          }
        }
        let creditHold = CreditHolds.findOne({orderId: order._id})
        if (creditHold){
          if (doc.amount >= creditHold.amount){
            CreditHolds.remove(creditHold._id)
          }else {
            let holdAmount = creditHold.amount - doc.amount;
            CreditHolds.update(creditHold._id, {$set: {amount: holdAmount}})
          }
        }
      }
    }
  }
});

CustomerTransactions.after.update(function (userId, doc){
    if (doc.transactionType == "invoices"){
        let invoice = Invoices.findOne({invoiceNumber: Number(doc.reference)});
        if (invoice && invoice.customerId === doc.customerId){
            if (this.previous.isOpen !== doc.isOpen){
                if (doc.isOpen && invoice.status === "paid"){
                    Invoices.update(invoice._id, {$set: {status: "unpaid"}})
                } else if(!doc.isOpen && invoice.status === "unpaid"){
                    Invoices.update(invoice._id, {$set: {status: "paid"}})
                }
            }
        }
    }


});

CustomerTransactions.before.insert(function (userId, doc) {
  if (doc.transactionType == "payments") {
    let paymentReference = doc.reference ? doc.reference.toUpperCase() : '';
    let payment = Payments.findOne({reference: paymentReference});
    if (payment && payment.orderId) {
      // enrich customer transaction
      doc.paymentId = payment._id;
      doc.orderId = payment.orderId;

      // Increase customer holds to block payment value
      let order = Orders.findOne(payment.orderId);
      if (order && doc.customerId === order.customerId) {
        let hold = CustomerHolds.findOne({orderId: order._id});
        if (hold) {
          let holdAmount = hold.amount + doc.amount;
          if (holdAmount > order.total) holdAmount = order.total;
          CustomerHolds.update(hold._id, {$set: {amount: holdAmount}});
          Core.Log.info(`[CustomerTransactions.before.insert] Increasing customer hold to ${holdAmount} for Order: ${order.orderNumber}`);
        } else {
          let holdDoc = {};
          holdDoc.customerId = order.customerId;
          holdDoc.orderId = order._id;
          holdDoc.amount = doc.amount;
          holdDoc.currency = doc.currency;
          CustomerHolds.insert(holdDoc);
          Core.Log.info(`[CustomerTransactions.before.insert] Increasing customer hold to ${doc.amount} for Order: ${order.orderNumber}`);
        }

        if (order.status === 'shipped') {
          // re-produce invoice based hold reduction
          let invoices = Invoices.find({orderId: order._id}).fetch();
          if (invoices & invoices.length > 0){
            // track invoices in customer transactions
            let invoiceNumbers = _.pluck(invoices, 'invoiceNumber');
            _.each(invoiceNumbers, String);
            let invoiceTransactions = CustomerTransactions.find({reference: {$in: invoiceNumbers}}).fetch(); 
            
            if (invoiceTransactions && invoiceTransactions.length > 0) {
              let invoiceTransactionReferences = _.pluck(invoiceTransactions, 'reference');
              _.each(invoices, function(invoice) {
                if (_.indexOf(invoiceTransactionReferences, String(invoice.invoiceNumber)) > -1) {
                  hold = CustomerHolds.findOne({orderId: order._id});
                  if (hold){
                    if (invoice.total >= hold.amount){
                      CustomerHolds.remove(hold._id)
                    } else {
                      let holdAmount =  hold.amount - invoice.total;
                      CustomerHolds.update(hold._id, {$set: {amount: holdAmount}})
                    }
                  }
                }
              });
            }
          }
        }


        // reduce credit if held
        let credithold = CreditHolds.findOne({orderId: order._id});
        if (credithold) {
          let creditHoldAmount = credithold.amount - doc.amount;
          if (creditHoldAmount > 0) {
            CreditHolds.update(credithold._id, {$set: {amount: creditHoldAmount}});
          } else {
            CreditHolds.remove(credithold._id);
          }
          Core.Log.info(`[CustomerTransactions.before.insert] Removing credit hold of ${doc.amount} for Order: ${order.orderNumber}`);
        }
      }

    
    }
  }
});

Payments.before.insert(function (userId, doc) {
  let paymentReference = doc.reference ? doc.reference.toUpperCase() : '';
  let transaction = CustomerTransactions.findOne({reference: paymentReference, transactionType: "payments"});
  if (transaction){
    let order = Orders.findOne(doc.orderId);
    if (order &&  transaction.customerId === order.customerId) {
      CustomerTransactions.update(transaction._id, {$set: {paymentId: doc._id, orderId: doc.orderId}});
      
      // Increase customer holds to block payment value
      let hold = CustomerHolds.findOne({orderId: order._id});
      if (hold) {
        let holdAmount = hold.amount + doc.amount;
        if (holdAmount > order.total) holdAmount = order.total;
        CustomerHolds.update(hold._id, {$set: {amount: holdAmount}});
        Core.Log.info(`[Payments.before.insert] Increasing customer hold to ${holdAmount} for Order: ${order.orderNumber}`);
      } else {
        let holdDoc = {};
        holdDoc.customerId = order.customerId;
        holdDoc.orderId = order._id;
        holdDoc.amount = doc.amount;
        holdDoc.currency = doc.currency;
        CustomerHolds.insert(holdDoc);
        Core.Log.info(`[Payments.before.insert] Increasing customer hold to ${doc.amount} for Order: ${order.orderNumber}`);
      }

      if (order.status === 'shipped') {
          // re-produce invoice based hold reduction
          let invoices = Invoices.find({orderId: order._id}).fetch();
          if (invoices & invoices.length > 0){
            // track invoices in customer transactions
            let invoiceNumbers = _.pluck(invoices, 'invoiceNumber');
            _.each(invoiceNumbers, String);
            let invoiceTransactions = CustomerTransactions.find({reference: {$in: invoiceNumbers}}).fetch(); 
            
            if (invoiceTransactions && invoiceTransactions.length > 0) {
              let invoiceTransactionReferences = _.pluck(invoiceTransactions, 'reference');
              _.each(invoices, function(invoice) {
                if (_.indexOf(invoiceTransactionReferences, String(invoice.invoiceNumber)) > -1) {
                  hold = CustomerHolds.findOne({orderId: order._id});
                  if (hold){
                    if (invoice.total >= hold.amount){
                      CustomerHolds.remove(hold._id)
                    } else {
                      let holdAmount =  hold.amount - invoice.total;
                      CustomerHolds.update(hold._id, {$set: {amount: holdAmount}})
                    }
                  }
                }
              });
            }
          }
        }

      // reduce credit if held
      let credithold = CreditHolds.findOne({orderId: order._id});
      if (credithold) {
        let creditHoldAmount = credithold.amount - doc.amount;
        if (creditHoldAmount > 0) {
          CreditHolds.update(credithold._id, {$set: {amount: creditHoldAmount}});
        } else {
          CreditHolds.remove(credithold._id);
        }
        Core.Log.info(`[Payments.before.insert] Removing credit hold of ${doc.amount} for Order: ${order.orderNumber}`);
      } 
    }
  }
});


Payments.after.insert(function (userId, doc) {
    let order = Orders.findOne(doc.orderId);
    if (order) {
      orderPayments = function() {
        let payments = 0;
        let cPayments = Payments.find({ orderId: order._id}).fetch();
        _.each(cPayments, function(p) {
          payments += p.amount;
        });
        return payments;
      };

      let appliedCredits = order.appliedCredits || 0;
      let payments = orderPayments();
      let totalPayments = appliedCredits + payments;

      if (totalPayments >= order.total) {
        Orders.update(order._id, {$set: {isCleared: true, paymentStatus: "paid"}});
        Core.Log.info(`[Payments.after.insert] Order paymentStatus set to paid and isCleared set for order ${doc.orderNumber}`);
      }

      if (totalPayments > 0 && totalPayments < order.total) {
        Orders.update({_id: order._id}, {$set: {paymentStatus: "partial"}});
        Core.Log.info(`[Payments.after.insert] Order paymentStatus set to partial for order ${doc.orderNumber}`);
      }

    }
});

PurchaseOrders.after.update(function (userId, doc) {
  let oldDoc = this.previous;
  if (doc.status !== "received" && oldDoc.status !== 'received' && doc.status !== "cancelled"){
    let hasReceivedItems = _.some(doc.items, function(item) {return item.status === "received" });
    if (hasReceivedItems) {
      PurchaseOrders.update({_id: doc._id}, {$set: {status: "received"}});
      Core.Log.info(`[PurchaseOrders.after.update] Purchase Order status set to received for purchase order ${doc.purchaseOrderNumber} with received items`);
    }
  }
});

function sendNotification(event, id, user,  groupId){
  Meteor.defer(function(){
    let nObject = {};
    nObject.event = event;
    nObject.userId = user;
    nObject.objectId = id;
    nObject.groupId =  groupId
    Meteor.call("notifications/sendNotification", nObject);
  });
}