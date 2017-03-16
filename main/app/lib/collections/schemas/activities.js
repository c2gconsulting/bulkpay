
/**
 * Activity Schema
 */
Core.Schemas.Activity = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    fullcode: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
    type: {// can be either 'unit' or 'project'
        type: String
    },
    unitOrProjectId: {
        type: String
    },
    businessId: {
        type: String,
    },
    createdAt: {
        type: Date,
        optional: true,
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