
/**
 * entity object Types Schema
 */
Core.Schemas.EntityObject = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String
    },
    parentId: {
        type: String,
        //regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ["Active", "Inactive"],
        optional: true
    },
    otype: {
        type: String,
        allowedValues: ["Unit", "Position", "Employee", "Job"]

    },
    businessId: {
        type: String
    },
    order: {
        type: Number
    },
    createdBy: {
        type: String,
        autoValue: function(){
            return Meteor.userId();
        },
        denyUpdate: true,
        optional: true
    },
    lastEditedBy: {
       type: String,
        autoValue: function(){
            return Meteor.userId();
        },
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
