/**
 * PostedPayrunResults Schema
 */
Core.Schemas.PostedPayrunResult = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitId: {
        type: String
    },
    period : {
        type: String
    },
    employeeIds : {
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
