
/**
 * Tax Types Schema
 */
Core.Schemas.Tax = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
    businessId: {
        type: String
    },
    code: {
        type: String
    },
    name: {
        type: String
    },
    grossIncomeRelief: {
        type: Number,
        defaultValue: 20
    },
    consolidatedRelief: {
        type: Number,
        defaultValue: 200000
    },
    payTypes: {
        type: [Object]
    },
    status: {
        type: String,
        defaultValue: "Active"
    },
    rules: {
        type: [Object]
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
