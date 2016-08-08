/**
 * ShipmentItem Schema
 * populate with order.items that are added to a shipment
 */
Core.Schemas.ShipmentItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true,
    autoValue: Core.schemaIdAutoValue
  },
  orderItemId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  quantity: {
    type: Number,
    min: 0
  },
  variantId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  orderPrice: {
    type: Number,
    decimal: true,
    optional: true,
    min: 0
  }
}); 


/**
 * Shipment Schema
 * used for order shipment tracking
 */

Core.Schemas.Shipment = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  orderId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  status: {
    type: String,
    index: 1,
    defaultValue: "pending",
    optional: true
  },
  shippedAt: {
    type: Date,
    optional: true
  },
  receivedAt: {
    type: Date,
    optional: true
  },
  packedAt: {
    type: Date,
    optional: true
  },
  isPickup: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  trackingNumber: {
    type: String,
    optional: true
  },
  trackingUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  trackingCompany: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate && !this.isSet) {
        return new Date;
      }
      this.unset();
    },
    denyUpdate: true,
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function () {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  }, 
  items: {
    type: [Core.Schemas.ShipmentItem],
    optional: true
  },
  shippingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  billingAddressId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  exchangeRate: {
    type: Number,
    decimal: true,
    defaultValue: 1.0,
    optional: true
  },
  receipt: {
    type: String,
    optional: true
  }
});



