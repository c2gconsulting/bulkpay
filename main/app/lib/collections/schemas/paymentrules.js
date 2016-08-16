
/**
 * Order Types Schema
 */
Core.Schemas.PaymentRule = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    name: {
        type: String
    },
    businessId: {
        type: String
    },
    rules: {
        type: Object
    },
    repaymentTypes: {
        type: [Object]
    },
    repaymentType: {
        type: String
    },
    status: {
        type: String,
        defaultValue: "Active"
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
