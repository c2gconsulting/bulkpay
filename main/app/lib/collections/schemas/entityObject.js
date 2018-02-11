
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
        allowedValues: ["Unit", "Position", "Job", "Location"]

    },
    businessId: {
        type: String
    },
    order: {
        type: Number,
        optional: true
    },
    createdBy: {
        type: String,
        autoValue: function(){
            return Meteor.userId();
        },
        //denyUpdate: true,
        optional: true
    },
    lastEditedBy: {
        type: String,
        autoValue: function(){
            return Meteor.userId();
        },
        optional: true
    },
    properties: {
        type: Object,
        optional: true,
        blackbox: true
    },

    "successFactors": {
        label: "Success Factors Config",
        optional: true,
        type: Object
    },
    'successFactors.externalCode': {
        type: String
    },
    'successFactors.costCenter': {
        type: Object
    },
    'successFactors.costCenter.code': {
        type: String
    },
    'successFactors.costCenter.name': {
        type: String
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
