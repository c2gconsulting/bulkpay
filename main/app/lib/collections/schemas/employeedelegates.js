
/**
* emailsettings  Schema
*/
Core.Schemas.EmployeeDelegate = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    name: {
        type: String
    },
    userId: {
        type: String,
        index: 1
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdBy: {
        type: String,
        index: 1
    },
  
    status: {
        type: String,
        optional: true,
        defaultValue: "Active"
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
