/**
 * Payresults Schema --- not in use
 */
Core.Schemas.PayResult = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  businessId: {
      type: String
  },
  employeeId: {
    type: String,
  },
  period: {
    type: String
  },
  employee: {
    type: Object,
    optional: true
  }, 
  log: {
    type: [Object],
    optional: true
  }, 
  payslip: {
    type: Object,
    optional: true
  }, 
  payslipWithCurrencyDelineation: {
    type: Object,
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
