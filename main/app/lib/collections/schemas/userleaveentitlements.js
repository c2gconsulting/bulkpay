Core.Schemas.UserLeaveDaysLeft = new SimpleSchema({
    year: {
        type: Number
    },
    daysLeft: {
        type: Number
    }
})

Core.Schemas.UserLeaveEntitlement = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    userId: {
        type: String,
    },
    leaveEntitlementId: {
        type: String
    },
    businessId: {
        type: String
    },
    leaveDaysLeft: {
        type: [Core.Schemas.UserLeaveDaysLeft]
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
