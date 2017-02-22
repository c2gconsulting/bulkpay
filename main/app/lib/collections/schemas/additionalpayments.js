
/**
 * Additional Payments Schema
 */
Core.Schemas.AdditionalPayment = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    paytype: {
        type: String
    },
    employee: {
        type: String
    },
    period: {
        type: String
    },
    amount: {
        type: Number
    },
    businessId: {
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
        denyUpdate: true,
        optional: true
    }
});