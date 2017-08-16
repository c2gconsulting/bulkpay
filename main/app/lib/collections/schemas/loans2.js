Core.Schemas.Loans2 = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    loanType: {
        type: String,
        optional: true
    },
    durationInMonths: {
        type: String,
        optional: true
    },
    interestRate: {
        type: Number,
        optional: true,
        decimal: true
    },
    amount: {
        type: Number,
        optional: true,
        decimal: true
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
        index: 1,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function() {
            if (this.isInsert) {
                if (this.isSet && Meteor.isServer) {
                    return this.value;
                } else {
                    return this.userId;
                }
            }
        },
        optional: true,
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