
/**
 * SupplementaryLeave Schema
 */
Core.Schemas.SupplementaryLeave = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    numberOfLeaveDays: {
        type: Number,
        optional: true,
        decimal: true
    },
    employees: {
        type: [String],
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
