
/**
 * Order Types Schema
 */
Core.Schemas.BusinessUnit = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaBusinessUnitNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
    },
    name: {
        type: String
    },
    parentId: {
        type: String,
        //regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    location: {
        type: String
    },
    status: {
        type: String,
        defaultValue: 'Active',
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
