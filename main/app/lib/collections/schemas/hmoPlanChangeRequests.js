Core.Schemas.HmoPlanChangeRequest = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    hmoPlanType: {
        type: String,
        optional: true
    },
    approvedBy: {
        type: String,
        optional: true
    },
    approvedDate: {
        type: Date,
        optional: true
    },
    businessId: {
        type: String
    },
    employeeId: {
        type: String,
        denyUpdate: true
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Open',
        allowedValues: ['Open', 'Approved', 'Rejected'],
        optional: true
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    isApprovalStatusSeenByCreator: {
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