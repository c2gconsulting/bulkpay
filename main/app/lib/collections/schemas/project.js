
/**
 * Leave Types Schema
 */
Core.Schemas.Project = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
    positionIds: {
        type: [String],
        label: "Positions",
        optional: true
    },
    businessId: {
        type: String,
        autoValue: function () {
            return BusinessUnits.findOne()._id
        }
    },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ['Active', 'Inactive'],
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
        denyUpdate: true
    }

});