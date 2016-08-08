/**
 * VariantMedia Schema
 */
Core.Schemas.VariantMedia = new SimpleSchema({
  mediaId: {
    type: String,
    optional: true
  },
  priority: {
    type: Number,
    optional: true
  },
  metafields: {
    type: [Core.Schemas.Metafield],
    optional: true
  },
  updatedAt: {
    type: Date,
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
  }
});

/*
 * VariantLocation Schema
 */

Core.Schemas.VariantLocation = new SimpleSchema({
  locationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  stockOnHand: {
    type: Number,
    optional: true
  },
  committedStock: {
    type: Number,
    optional: true
  }
});


/**
 * ProductVariant Schema
 */

Core.Schemas.ProductVariant = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  productId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    index: 1
  },
  code: {
    type: String,
    optional: true,
    index: 1,
    autoValue: function () {
      let originVariantCode = this.field('originVariantCode').value;
      if (originVariantCode){
        return originVariantCode;
      } else {
        return this.field('code').value;
      }
    }
  },
  blocked: {
    type: Boolean,
    defaultValue: false
  },
  name: {
    type: String,
    optional: true,
    index: 1
  },
  originVariantCode: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  description: {
    type: String,
    optional: true,
    index: 1
  },
  status: {
    type: String,
    defaultValue: "active",
    index: 1,
    optional: true
  },
  upc: {
    type: String,
    optional: true
  },
  supplierCode: {
    type: String,
    optional: true
  },
  manageStock: {
    type: Boolean,
    defaultValue: false
  },
  keepSelling: {
    type: Boolean,
    defaultValue: true
  },
  taxable: {
    type: Boolean,
    defaultValue: true
  },
  isOnline: {
    type: Boolean,
    defaultValue: true
  },
  onlineOrdering: {
    type: Boolean,
    defaultValue: true
  },
  onlineId: {
    type: String,
    optional: true
  },
  opt1: {
    type: String,
    optional: true
  },
  opt2: {
    type: String,
    optional: true
  },
  opt3: {
    type: String,
    optional: true
  },
  opt4: {
    type: String,
    optional: true
  },
  buyPrice: {
    type: Number,
    decimal: true,
    optional: true
  },
  lastCostPrice: {
    type: Number,
    decimal: true,
    optional: true
  },
  stockOnHand: {
    type: Number,
    optional: true,
    min: 0
  },
  committedStock: {
    type: Number,
    optional: true,
    min: 0
  },
  maxOnlineStock: {
    type: Number,
    optional: true,
    min: 0
  },
  movingAveragePrice: {
    type: Number,
    decimal: true,
    optional: true
  },
  createdAt: {
    label: "Created at",
    type: Date,
    optional: true
  },
  updatedAt: {
    label: "Updated at",
    type: Date,
    optional: true
  },
  productName: {
    type: String,
    optional: true
  },
  variantPrices: {
    type: [Object],
    optional: true
  },
  "variantPrices.$.priceListCode": {
    type: String
  },
  "variantPrices.$._id": {
    type: String,
    autoValue: function () {
     if (this.operator !== "$pull"){
       return Random.id()
     }
    },
    optional: true
  },
  "variantPrices.$.value": {
    type: Number,
    decimal: true,
    min: 0
  },
  composite: { // variant is a composite object (BOM)
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  sellable: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  locations: {
    type: [Core.Schemas.VariantLocation],
    optional: true
  },
  barcode: {
    label: "Barcode",
    type: String,
    optional: true
  },
  retailPrice: {
    label: "MSRP", // default retail price
    type: Number,
    optional: true,
    decimal: true,
    min: 0
  },
  wholesalePrice: {
    label: "Price", // default wholesale price
    type: Number,
    decimal: true,
    min: 0,
    optional: true
  },
  weight: {
    type: Number,
    min: 0,
    optional: true
  },
  uom: {
    label: "UoM",
    type: String,
    optional: true
  },
  media: {
    type: [Object],
    optional: true
  },
  masterVariantCode: {
    type: String,
    optional: true,
    index: 1
  }
});


/**
 * Product Schema
 */

Core.Schemas.Product = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    index: 1
  },
  description: {
    type: String,
    optional: true
  },
  productType: {
    type: String,
    optional: true
  },
  supplier: {
    type: String,
    optional: true
  },
  brand: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  brandId: {
    type: String,
    optional: true
  },
  originProductId: {
    type: String,
    optional: true,
    denyUpdate: true
  },
  tags: {
    type: [String],
    optional: true
  },
  opt1: {
    type: String, 
    optional: true
  },
  opt2: {
    type: String, 
    optional: true
  },
  opt3: {
    type: String, 
    optional: true
  },
  opt4: {
    type: String, 
    optional: true
  },
  imageUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  searchTerms: {
    type: [String],
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
    optional: true
  },
  createdBy: {
    type: String,
    autoValue: function () {
      let userId = this.value || this.userId;
      if (this.isInsert) {
        return  userId;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: userId
        };
      }
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
  }
});
