
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
    grossIncomeRelief: {
        type: Number,
        defaultValue: 20
    },
    consolidatedRelief: {
        type: Number,
        defaultValue: 200000
    },
    bucket: {
        type: String
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
