
/**
 * Payrun Types Schema
 */
Core.Schemas.Payrun = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
    businessId: {
        type: String
    },
    numberOfEmployees: {
        type: Number
    },
    payGroup: {
        type: String
    },
    paymentDate: {
        type: Date,
        defaultValue: new Date
    },
    totalAmountPaid: {
        type: Number
    },
    paymentPeriod: {
        type: Object
    },
    taxPaid: {
        type: Number
    },
    pensionPaid: {
        type: Number
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
