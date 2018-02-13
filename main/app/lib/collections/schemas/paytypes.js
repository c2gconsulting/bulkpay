
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
        type: String,
        allowedValues: ["Benefit", "Deduction", "OneOff"], //removed allowed value wage
        defaultValue: "Benefit"
    },
    frequency: {
        type: String,
        defaultValue: "Monthly",
        allowedValues: ["Weekly", "Bi-Monthly", "Monthly", "Quarterly", "Bi-Annually", "Annually"]
    },
    taxable: {
        type: Boolean,
        defaultValue: false
    },
    addToTotal: {
        type: Boolean,
        defaultValue: false
    },
    editablePerEmployee: {
        type: Boolean,
        defaultValue: false
    },
    reliefFromTax: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    hourlyRate: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    derivative: {
        type: String,
        allowedValues: ["Fixed", "Formula"],
        defaultValue: "Fixed"
    },
    status: {
        type: String,
        defaultValue: "Active",
        allowedValues: ["Active", "Inactive"]
    },
    currency: {
        type: String
    },
    isBase: {
        type: Boolean,
        defaultValue: false
    },
    isTimeWritingDependent: {
        type: Boolean,
        defaultValue: false
    },
    includeWithSapIntegration: {
        type: Boolean,
        defaultValue: false
    },

    "successFactors": {// externalCode
        label: "Success Factors PayType Config",
        optional: true,
        type: Object,
        blackbox: true
    },
    _groupId: {
        type: String,
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
