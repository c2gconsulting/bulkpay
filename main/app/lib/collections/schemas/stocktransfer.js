/**
 * Created by ramza on 8/1/16.
 */

Core.Schemas.StockTransferItem = new SimpleSchema({
    _id: {
        type: String,
        autoValue: Core.schemaIdAutoValue,
        optional: true
    },
    quantity: {
        type: Number,
        min: 1
    },
    variantId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        index: 1,
        custom: function () {
            let variantId = this.siblingField("variantId").value;
            let variant = ProductVariants.findOne(variantId);
            if (variant && variant.blocked) {
                return "itemBlocked";
            }
        }
    }
});

/**
 * StockTransfer Schema
 * Creates a record history between stock movements from one location to another
 */
Core.Schemas.StockTransfer = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    destinationId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    quantity: {
        type: Number,
        min: 0,
        optional: true,
        autoValue: function() {
            if (this.field('items').isSet && (this.isInsert || this.isUpsert)) {
                let items = this.field('items').value;
                let totalQuantity = 0;
                _.each(items, function(item) {
                    totalQuantity = item.quantity || 0;
                });

                if (this.isInsert) {
                   return totalQuantity
                 } else if (this.isUpsert) {
                    return {
                        $setOnInsert: totalQuantity
                    }
                }
            }
        }
    },
    sourceId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        index: 1
    },
    stockTransferNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaStockTransferNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
    },
    items: {
        type: [Core.Schemas.StockTransferItem],
        minCount: 1
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            } else {
                this.unset();
            }
        },
        denyUpdate: true,
        optional: true
    },
    updatedAt: {
        type: Date,
        autoValue: function () {
            if (this.isUpdate) {
                return new Date;
            }
        },
        optional: true
    },
    receivedAt: {
        type: Date,
        optional: true
    },
    userId: {
        type: String,
        index: 1,
        autoValue: function() {
            if (this.isInsert) {
                if (this.isSet && Meteor.isServer) {
                    return this.value;
                } else {
                    return this.userId;
                }
            }
        },
        optional: true,
        denyUpdate: true
    },
    notes: {
        type: [Core.Schemas.Note],
        optional: true
    }
}); 
