
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
       employeeId: {
          type: String,
       },
        payment: {
          type: [Object]
        },
        'payment.$': {
          type: Object
        },
        'payment.$.id': {
          type: String,
          regEx: SimpleSchema.RegEx.Id,
          optional: true
        },
        'payment.$.reference': {
          type: String,
          allowedValues: ['Tax', 'Pension', 'Standard', 'Paytype'],
          defaultValue: 'Paytype'
        },
        'payment.$.amountLC': { // amount in Local Currency
          type: Number
        },

        'payment.$.amountPC': { // amount in paytype Currency
            type: Number
        },
        'payment.$.code': { // Will be used if paytype is deleted from the system... keeps a reference to the payment code as as payroll run
          type: Number
        },
        'payment.$.description': { // Will be used if paytype is deleted from the system... keeps a reference to the payment description as as payroll run
          type: Number
        },
        period: {
          type: String
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
