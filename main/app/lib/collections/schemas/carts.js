/**
 * CartItem Schema
 */

Core.Schemas.CartItem = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  productId: {
    type: String,
    index: 1
  },
  tenantId: {
    type: String,
    index: 1,
    label: "Cart Item tenantId",
    optional: true
  },
  quantity: {
    label: "Quantity",
    type: Number,
    min: 0
  },
  variants: {
    type: Core.Schemas.ProductVariant
  }
});

/**
 * Cart Schema
 */
Core.Schemas.Cart = new SimpleSchema({
  userId: {
    type: String,
    autoValue: function () {
      if (this.isInsert || this.isUpdate) {
        if (!this.isFromTrustedCode) {
          return this.userId;
        }
      } else {
        this.unset();
      }
    }
  },
  sessionId: {
    type: String,
    autoValue: function () {
      return Core.sessionId;
    },
    index: 1
  },
  email: {
    type: String,
    optional: true,
    index: 1,
    regEx: SimpleSchema.RegEx.Email
  },
  items: {
    type: [Core.Schemas.CartItem],
    optional: true
  },
  shipping: {
    type: [Core.Schemas.Shipment],
    optional: true,
    blackbox: true
  },
  billing: {
    type: [Core.Schemas.Payment],
    optional: true,
    blackbox: true
  },
  totalPrice: {
    label: "Total Price",
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  workflow: {
    type: Core.Schemas.Workflow,
    optional: true
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
      }
    },
    denyUpdate: true
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
  }
});
