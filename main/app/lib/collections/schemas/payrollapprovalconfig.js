

/**
 * PayrollApprovalConfig Schema
 */
Core.Schemas.PayrollApprovalConfig = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    requirePayrollApproval: {
        type: Boolean
    },
    approvers: {
        type: [String]
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
