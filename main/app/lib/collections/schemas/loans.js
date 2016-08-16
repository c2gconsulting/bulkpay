
/**
 * Order Types Schema
 */
Core.Schemas.Loan = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    employee: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    amount: {
        type: Number
    },
    activeAmount: {
        type: Number,
        autoValue: function(){
            if (!this.isSet) {
                return this.field("amount").value;
                // review with toystar
            }
        }
    },
    payments: {
        type: [Number]
    },
    rate: {
        type: Number
    },
    term: {
        type: Number
    },
    payCount: {
        type: Number,
        defaultValue: 0
    },
    fullyServiced: {
        type: String,
        defaultValue: "No"
    },
    purpose: {
        type: String,
        defaultValue: 'Loan'
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
