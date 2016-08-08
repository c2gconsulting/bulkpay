/**
 * Products
 */
Core.publish("Products", function () {
  return Products.find();
});

/**
 * Brands
 */
Core.publish("Brands", function () {
  return Brands.find();
});

/**
 * Pricelists
 */
Core.publish("PriceLists", function () {
  return PriceListGroups.find();
});

Core.publish("ActivePriceLists", function () {
  return PriceListGroups.find({});
});

/**
 * ProductVariants
 */
Core.publish("ProductVariants", function () {
  return ProductVariants.find();
});


/**
 * OrderVariants
 */
Core.publish("OrderVariants", function (variantIds, locationId, priceListCodes) {
  priceListCodes = priceListCodes || [];
  return ProductVariants.find({ 
            _id: { $in: variantIds }
          }, {
            fields: {
              locations: {
                $elemMatch: { 'locationId': locationId } 
              },
              variantPrices: {
                $elemMatch: { 'priceListCode': { $in: priceListCodes }}
              }
            }
          });
});

/**
 * Variants for single order
 */

Core.publish("VariantsForOrder", function (id) {
  let orderCursor = Orders.find({ _id: id });
  let order = orderCursor.fetch();

  // if the entry exists and user is authorized up to READONLY for role and location, publish
  if (order.length > 0 && Core.hasOrderAccess(this.userId, order[0].salesLocationId, true)) {
    //extract order items variants
    let variantIds = [];
    for (i in order[0].items) {
      variantIds[i] = order[0].items[i].variantId;
    }

    // extract priceListCodes
    let priceListCodes = [];
    let priceListGroup = PriceListGroups.findOne({ code: order.priceListCode });
    if (priceListGroup) priceListCodes = priceListGroup.priceListCodes;

    return ProductVariants.find({
        _id: { $in: variantIds }
      }, {
        fields: {
          locations: {
            $elemMatch: { locationId: order[0].stockLocationId } //this is useful for clone
          },
          variantPrices: {
            $elemMatch: { 'priceListCode': { $in: priceListCodes }}
          }
        }
      });
  }
  return this.ready();

});


Core.publish("SupplierActivePriceLists", function (supplierId) {
  this.unblock(); // eliminate wait time impact

  let supplier = Companies.findOne(supplierId);
  let cursors;

  if (supplier){
    Partitioner.bindGroup(supplier.tenantId, function(){
        cursors = PriceListGroups.find({});
    });
  }

  if (cursors){
    return cursors
  } else return this.ready();
});

/**
 * SupplierOrderVariants
 */
Core.publish("SupplierOrderVariants", function (supplierId, variantIds, locationId, priceListCodes) {
  console.log(arguments)
  let supplier = Companies.findOne(supplierId);
  let cursors;
  if (supplier){
    Partitioner.bindGroup(supplier.tenantId, function(){
      priceListCodes = priceListCodes || [];
      cursors =  ProductVariants.find({
        _id: { $in: variantIds }
      }, {
        fields: {
          locations: {
            $elemMatch: { 'locationId': locationId }
          },
          variantPrices: {
            $elemMatch: { 'priceListCode': { $in: priceListCodes }}
          }
        }
      });
    })
  }
  if (cursors){
    return cursors
  } else return this.ready();
});


/**
 * Variants for single purchase order
 */

Core.publish("VariantsForPurchaseOrder", function (id) {
  let orderCursor = PurchaseOrders.find({ _id: id });
  let order = orderCursor.fetch();

  // if the entry exists and user is authorized for role and location, publish
  if (order.length > 0) {
    //extract order items variants
    let variantIds = [];
    for (i in order[0].items) {
      variantIds[i] = order[0].items[i].variantId;
    }

    // extract priceListCodes
    let priceListCodes = [];
    let priceListGroup = PriceListGroups.findOne({ code: order.priceListCode });
    if (priceListGroup) priceListCodes = priceListGroup.priceListCodes;

    return ProductVariants.find({
      _id: { $in: variantIds }
    }, {
      fields: {
        locations: {
          $elemMatch: { locationId: order[0].shippingAddressId } //this is useful for clone
        },
        variantPrices: {
          $elemMatch: { 'priceListCode': { $in: priceListCodes }}
        }
      }
    });
  }
  return this.ready();

});


/**
 * OrderVariants
 */
Core.publish("VariantsForStockTransfer", function (variantIds) {
  return ProductVariants.find({
    _id: { $in: variantIds }
  });
});


/**
 * Variants for single stock transfer
 */

Core.publish("VariantsForTransfer", function (id) {
  let transferCursor = StockTransfers.find({ _id: id });
  let stockTransfer = transferCursor.fetch();

  // if the entry exists and user is authorized for role and location, publish
  if (stockTransfer.length > 0) {
    //extract order items variants
    let variantIds = [];
    for (i in stockTransfer[0].items) {
      variantIds[i] = stockTransfer[0].items[i].variantId;
    }


    return ProductVariants.find({
      _id: { $in: variantIds }
    });
  }
  return this.ready();

});


/**
 * Variants for single stock adjustment
 */

Core.publish("VariantsForAdjustment", function (id) {
  let adjustmentCursor = StockAdjustments.find({ _id: id });
  let stockAdjustment = adjustmentCursor.fetch();

  // if the entry exists and user is authorized for role and location, publish
  if (stockAdjustment.length > 0) {
    //extract order items variants
    let variantIds = [];
    for (i in stockAdjustment[0].items) {
      variantIds[i] = stockAdjustment[0].items[i].variantId;
    }


    return ProductVariants.find({
      _id: { $in: variantIds }
    });
  }
  return this.ready();

});


