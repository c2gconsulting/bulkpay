/**
 * Customers Schema
 */
Core.Schemas.Company = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  name: {
    type: String,
    label: "Name",
    index: 1
  },
  description: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    label: "Title",
    optional: true
  },
  addressBook: {
    type: [Core.Schemas.Address],
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  groupCode: {
    type: String,
    optional: true
  },
  companyType: {
    type: String, 
    allowedValues: ["distributor", "wholesaler", "retailer", "consumer", "producer"],
    defaultValue: "distributor",
    optional: true
  },
  locale: {
    type: String,
    defaultValue: "en"
  },
  timezone: {
    type: String,
    optional: true
  },
  history: {
    type: [Core.Schemas.History],
    optional: true
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
  defaultSalesLocationId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  defaultAssigneeId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  defaultTaxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  searchTerms: {
    type: String,
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
  tenantId: {
    type: String,
    optional: true
  }
});


