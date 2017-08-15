
/**
 * TimeType Schema
 */

Core.Schemas.TimeType = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    positionIds: {
        type: [String],
        label: "Positions",
        optional: true
    },
    payGradeIds: {
        type: [String],
        label: "Pay Grades",
        optional: true
    },
    valuation: {
        type: String,
        optional: true
    },
    paid: {
        type: Boolean,
        defaultValue: true
    },
    businessId: {
        type: String
    },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ['Active', 'Inactive'],
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
        denyUpdate: true
    }

})