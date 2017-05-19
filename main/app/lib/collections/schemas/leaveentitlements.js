
Core.Schemas.LeaveEntitlement = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    numberOfLeaveDaysPerAnnum: {
        type: Number,
        optional: true
    },
    payGradeIds: {
        type: [String],
        optional: true
    },
    allowLeaveRequestsInHours: {
        type: Boolean,
    },
    businessId: {
        type: String,
        optional: true
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
