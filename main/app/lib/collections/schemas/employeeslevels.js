/**
* Approvals Configs Schema
*/
Core.Schemas.EmployeesLevels = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
    },
    businessId: {
        type: String
    },
    label: {
        type: String,
    },
    code:{
        type: String
    },
    createdBy: {
        type: String
    },
    createdAt: {
        type: Date,
        autoValue: function() {

            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date};
            } else {
                this.unset();
            }
        }
    }

});
