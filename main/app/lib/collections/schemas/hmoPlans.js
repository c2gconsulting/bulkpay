
/**
 * HmoPlan Schema
 */

Core.Schemas.HmoPlan = new SimpleSchema({
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
    maximumDurationInMonths: {
        type: String,
        label: "Max Duration (months)",
        optional: true
    },
    paid: {
        type: Boolean,
        defaultValue: true,
        optional: true
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