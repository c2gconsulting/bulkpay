
/**
 * Activity Schema
 */
Core.Schemas.Activity = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    code: {
        type: String,
        optional: true
    },
    externalCode: {
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
    manager: {
        type: String,
        optional: true
    },
    managerId: {
        type: String,
        optional: true
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