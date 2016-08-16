
/**
 * Order Types Schema
 */
Core.Schemas.Payroll = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    payRunId: {
        type: String
    },
    employee: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    position: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    pensionManager: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    YTD: {
        type: Object,
        defaultValue: {
            gross: 0,
            net: 0,
            tax: 0
        }
    },
    grossPay: {
        type: Number
    },
    tax: {
        type: Number
    },
    pension: {
        type: Number
    },
    totalDeduction: {
        type: Number
    },
    netPay: {
        type: Number
    },
    payRun: {
        type: Object,
        defaultValue: {}
    },
    paymentPeriod: {
        type: Object
    },
    paymentInformation: {
        type: Object
    },
    expenses: {
        type: [Object]
    },
    repayments: {
        type: [Object]
    },
    payTypes: {
        type: [Object]
    },
    paymentDetails: {
        type: Object
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
