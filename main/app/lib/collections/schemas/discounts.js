/**
* DiscountType Schema
*/

Core.Schemas.DiscountType = new SimpleSchema({
  percentage: {
    type: Number,
    optional: true,
    label: "Percentage"
  },
  fixed: {
    type: Number,
    optional: true,
    label: "Price Discount"
  },
  shipping: {
    type: Boolean,
    label: "Free Shipping",
    optional: true
  }
});
 
/**
* DiscountRule Schema
*/
Core.Schemas.DiscountRule = new SimpleSchema({
  "validUses": {
    type: Number,
    optional: true
  },
  "products": {
    type: [String],
    optional: true
  },
  "codes": {
    type: [String],
    optional: true
  },
  "range": {
    type: [Object],
    optional: true
  },
  "range.$.begin": {
    type: Number,
    optional: true
  },
  "range.$.end": {
    type: Number,
    optional: true
  }
});

/**
* Discount Schema
*/
Core.Schemas.Discount = new SimpleSchema({
  beginDate: {
    type: Date,
    optional: true
  },
  endDate: {
    type: Date,
    optional: true
  },
  discount: {
    type: Core.Schemas.DiscountType
  },
  rules: {
    type: Core.Schemas.DiscountRule
  }
});
