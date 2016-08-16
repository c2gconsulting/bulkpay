
/**
 * Order Types Schema
 */
Core.Schemas.PayType = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String
    },
    title: {
        type: String
    },
    businessId: {
        type: String
    },
    type: {
        type: String
    },
    frequency: {
        type: String,
        defaultValue: "Monthly"
    },
    taxable: {
        type: String,
        defaultValue: "Yes"
    },
    editablePerEmployee: {
        type: String,
        defaultValue: "No"
    },
    derivative: {
        type: String,
        defaultValue: "Fixed"
    },
    status: {
        type: String,
        defaultValue: "Active"
    },
    isBase: {
        type: Boolean,
        defaultValue: false
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