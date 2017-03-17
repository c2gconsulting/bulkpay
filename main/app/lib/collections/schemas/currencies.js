
/**
 * Currency Schema
 */
Core.Schemas.Currency = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    rateToBaseCurrency: {
        type: Number,
        decimal: true,
    },
    period: {
        type: String,
    },
    businessId: {
        type: String,
    },
    createdAt: {
        type: Date,
        optional: true,
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