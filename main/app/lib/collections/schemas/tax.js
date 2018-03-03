
/**
 * Tax Types Schema
 */
Core.Schemas.Tax = new SimpleSchema({
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
    isUsingEffectiveTaxRate: {
        type: Boolean,
        optional: true
    },
    effectiveTaxRate: {
        type: Number,
        optional: true,
        decimal: true
    },
    usingSuccessFactorsWithholdingTaxRate: {
        type: Boolean,
        optional: true
    },
    successFactorsTaxRate: {
        type: Number,
        optional: true,
        decimal: true
    },
    employees: {
        type: [String],
        optional: true
    },
    grossIncomeBucket: {
        type: String,
        optional: true
    },
    grossIncomeRelief: {
        type: Number,
        defaultValue: 20,
        optional: true
    },
    consolidatedRelief: {
        type: Number,
        defaultValue: 200000,
        optional: true
    },
    bucket: {
        type: String,
        optional: true
    },
    status: {
        type: String,
        defaultValue: "Active",
        optional: true
    },
    rules: {
        type: Array,
        optional: true
    },
    successFactorsConsultancyTax: {
        type: Boolean,
        optional: true
    },
    "rules.$": {
        type: Object,
        optional: true
    },
    "rules.$.range": {
        type: String,
        optional: true,
        allowedValues: ["First", "Next", "Over"]
    },
    "rules.$.upperLimit": {
        type: Number,
        optional: true
    },
    "rules.$.rate": {
        type: Number,
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
