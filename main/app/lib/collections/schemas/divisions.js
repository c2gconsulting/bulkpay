
/**
 * Order Types Schema
 */
Core.Schemas.Division = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    divisionNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaDivisionNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
    },
    name: {
        type: String
    },
    parentId: {
        type: String,
        optional: true
        //regEx: SimpleSchema.RegEx.Id
    },
    location: {
        type: String,
        optional: true
    },
    businessId: {
        type: String,
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Active'
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
