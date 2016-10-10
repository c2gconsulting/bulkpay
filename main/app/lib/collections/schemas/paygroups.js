
/**
 * Order Types Schema
 */
Core.Schemas.PayGroup = new SimpleSchema({
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
    tax: {
        type: String
    },
    pension: {
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
        denyUpdate: true,
        optional: true
    }
});
