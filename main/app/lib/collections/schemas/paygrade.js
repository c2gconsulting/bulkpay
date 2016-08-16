
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
    name: {
        type: String
    },
    description: {
        type: String
    },
    businessId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    positionIds: {
        type: [String]
    },
    positions: {
        type: [String],
        regEx: SimpleSchema.RegEx.Id
    },
    taxRuleId: {
        type: String
    },
    tax: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    pensionRuleId: {
        type: String
    },
    pension: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    status: {
        type: String,
        defaultValue: "Active"
    },
    payTypes: {
        type: [Core.Schemas.PayTypes]
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