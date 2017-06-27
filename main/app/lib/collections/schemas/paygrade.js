/**
 * Order Types Schema
 */
Core.Schemas.PayGrade = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    description: {
        type: String
    },
    businessId: {
        type: String
    },
    positions: {
        type: [String]
    },
    payGroups: {
        type: [String]
    },
    status: {
        type: String,
        defaultValue: "Active",
        allowedValues: ["Active", "Inactive"]
    },
    payTypes: {
        type: [Object],
        blackbox: true
    },
    payTypePositionIds: {// One of the keys each object has payTypePositionId
        type: [Object],
        blackbox: true
    },
    netPayAlternativeCurrency: {
        type: String,
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
        denyUpdate: true,
        optional: true
    }
});