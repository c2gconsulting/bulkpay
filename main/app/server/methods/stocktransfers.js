/**
 *  Order Methods
 */
Meteor.methods({

    /**
     * purchaseorders/create
     * @summary when we create a new purchase order attach all the necessary fields
     * @param {Object} doc - optional purchaseOrder object
     * @return {String} return insert result
     */

    "stockTransfers/create": function (doc) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(doc, Core.Schemas.StockTransfer);
        } catch (e) {
            throw new Meteor.Error(401, "There's invalid data in your stock transfer. Please correct and retry");
        }
        if (doc.sourceId !== doc.destinationId){
            let stockTransferId = StockTransfers.insert(doc);
            if (stockTransferId){
                let items = doc.items;
                _.each(items, function (r) {
                    let variant = ProductVariants.findOne(r.variantId);
                    if (variant) {
                        let sourceLocation = _.findWhere(variant.locations, {locationId: doc.sourceId});
                        let destinationLocation = _.findWhere(variant.locations, {locationId: doc.destinationId});
                        if (sourceLocation) {
                            let currentStock = sourceLocation.stockOnHand || 0;
                            currentStock -= r.quantity;
                            ProductVariants.update({_id: variant._id, "locations.locationId": doc.sourceId},
                                {
                                    "$set": {
                                        'locations.$.stockOnHand': currentStock
                                    }
                                });
                        } else {
                            let locationDoc = {};
                            locationDoc.stockOnHand = 0 - r.quantity || 0;
                            locationDoc.locationId = doc.sourceId;
                            ProductVariants.update({_id: variant._id},
                                {
                                    "$addToSet": {locations: locationDoc}
                                });
                        }
                        if (destinationLocation){
                            let newStock = destinationLocation.stockOnHand || 0;
                            newStock += r.quantity;
                            ProductVariants.update({_id: variant._id, "locations.locationId": doc.destinationId},
                                {
                                    "$set": {
                                        'locations.$.stockOnHand': newStock
                                    }
                                });
                        } else {
                            let destinationDoc = {};
                            destinationDoc.stockOnHand = r.quantity;
                            destinationDoc.locationId = doc.destinationId;
                            ProductVariants.update({_id: variant._id},
                                {
                                    "$addToSet": {locations: destinationDoc}
                                });
                        }
                    }
                });
                let newStockTransfer = StockTransfers.findOne(stockTransferId);
                return {_id: stockTransferId, stockTransferNumber: newStockTransfer.stockTransferNumber};
            }   
        } else throw new Meteor.Error(401, "Sorry!! Source and Destination cannot be the same");
    },

    "stocktransfers/addNote": function (id, message) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(id, String);
        check(message, String);
        let stockTransfer = StockTransfers.findOne(id);
        if (stockTransfer){
            let updateStatus = StockTransfers.update(id, {
                $addToSet: {
                    notes: {
                        body: message,
                        userId: Meteor.userId(),
                        createdAt: new Date()
                    }
                }
            });
            return true
        } else  throw new Meteor.Error(401, "Unauthorized");
    }
});
