/**
 *  StockAdjustments Methods
 */
Meteor.methods({

  /**
   * stockAdjustments/create
   * @summary creating new stock transfer
   * @param {Object} doc - stock transfer document
   * @return {String} return insert result
   */

  "stockAdjustments/create": function (doc) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let userId = Meteor.userId();

    try {
      check(doc, Core.Schemas.StockAdjustment);
    } catch (e) {
      throw new Meteor.Error(401, "There's invalid data in your stock adjustment. Please correct and retry");
    }

    let stockAdjustmentId = StockAdjustments.insert(doc);
    if (stockAdjustmentId) {
      let items = doc.items;
      _.each(items, function (r) {
        let variant = ProductVariants.findOne(r.variantId);
        if (variant) {
          let location = _.findWhere(variant.locations, {locationId: doc.locationId});
          if (location) {
            let currentStock = location.stockOnHand || 0;
            currentStock -= r.quantity;
            ProductVariants.update({_id: variant._id, "locations.locationId": doc.locationId},
              {
                "$set": {
                  'locations.$.stockOnHand': currentStock
                }
              });
          } else {
            let locationDoc = {};
            locationDoc.stockOnHand = 0 - r.quantity || 0;
            locationDoc.locationId = doc.locationId;
            ProductVariants.update({_id: variant._id},
              {
                "$addToSet": {locations: locationDoc}
              });
          }
        }
      });
      let newStockAdjustment = StockAdjustments.findOne(stockAdjustmentId);
      return {
        _id: stockAdjustmentId,
        stockAdjustmentNumber: newStockAdjustment.stockAdjustmentNumber
      };
    }

  },

  "stockAdjustments/addNote": function (id, message) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    check(id, String);
    check(message, String);
    let stockAdjustment = StockAdjustments.findOne(id);
    if (stockAdjustment) {
      StockAdjustments.update(id, {
        $addToSet: {
          notes: {
            body: message,
            userId: Meteor.userId(),
            createdAt: new Date()
          }
        }
      });
      return true
    } else  throw new Meteor.Error(401, "Stock Adjustment not found.");
  }

});
