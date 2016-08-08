

/**
 * Suppliers Schema
 */
Core.Schemas.Supplier = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  supplierNumber: {
    type: String,
    index: 1,
    autoValue: Core.schemaSupplierNextSeqNumber,
    optional: true, // to enable pre-validation
    denyUpdate: true
  },
  name: {
    type: String,
    label: "Name",
    index: 1
  },
  title: {
    type: String,
    label: "Title",
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  phone: {
    type: String,
    optional: true
  },
  /*address: {
    type: String,
    optional: true
  },*/
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  locale: {
    type: String,
    defaultValue: "en"
  },
  currency: {
    type: Object,
    optional: true
  },
  "currency.iso": {
    type: String
  },
  "currency.symbol": {
    type: String,
    optional: true
  },
  blocked: {
    type: Boolean,
    defaultValue: false
  },
  direct: { // Direct customer, key for 2nd and 3rd tier extensions
    type: Boolean,
    defaultValue: true
  },
  defaultTaxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  creditTerms: {
    type: String,
    min: 0,
    label: "Credit Terms",
    optional: true
  },
  searchTerms: {
    type: String,
    optional: true
  },
  addressBook: {
    type: [Core.Schemas.Address],
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
  companyId: {
    type: String,
    optional: true
  }
});


