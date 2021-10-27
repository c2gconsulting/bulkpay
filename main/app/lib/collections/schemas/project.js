
/**
 * Projects Schema
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
    "project_number": {
        type: String,
        optional: true
    },
    "object_number": {
        type: String,
        optional: true
    },
    "external_project_number": {
        type: String,
        optional: true
    },
    "project_manager": {
        type: String,
        optional: true
    },
    positionIds: {
        type: [String],
        label: "Positions",
        optional: true
    },
    businessId: {
        type: String
    },
    // 'activities': {
    //     type: [Object],
    //     optional: true
    // },
    // 'activities.$': {
    //     type: Object,
    //     optional: true
    // },
    // 'activities.$.fullcode': {
    //     type: String
    // },
    // 'activities.$.description': {
    //     type: String
    // },
    // "activities.$.wbs_number": {
    //     type: String,
    //     optional: true
    // },
    // "activities.$.object_number": {
    //     type: String,
    //     optional: true
    // },
    // "activities.$.external_wbs_number": {
    //     type: String,
    //     optional: true
    // },
    // "activities.$.wbs_manager": {
    //     type: String,
    //     optional: true
    // },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ['Active', 'Inactive'],
        optional: true
    },
    "successFactors": {// externalCode
        label: "Success Factors project Config",
        optional: true,
        type: Object,
        blackbox: true
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
