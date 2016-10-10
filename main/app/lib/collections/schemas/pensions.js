
/**
 * Pension Types Schema
 */
Core.Schemas.Pension = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    code: {
        type: String
    },
    name: {
        type: String
    },
    status: {
        type: String,
        defaultValue: "Active",
        allowedValues: ["Active","Inactive"],
        optional: true
    },
    payTypes: {
        type: [String],
        optional: true
    },
    employerContributionRate: {
        type: Number
    },
    employeeContributionRate: {
        type: Number
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
        optional: true,
        denyUpdate: true
    }
});
