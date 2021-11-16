/**
* Approvals Configs Schema
*/
Core.Schemas.ApprovalsConfigs = new SimpleSchema({
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
    level: {
        type: String,
    },
    transportationMode:{
        type: String,
        defaultValue: 'AIR',
        allowedValues: ['AIR', 'LAND'],
    },
    isInternational: {
        type: Boolean
    },
    numberOfApprovals:{
        type: Number,
        defaultValue: 1
    },
    createdBy: {
        type: String
    },
    'approvals': {
        type: [Object],
        optional: true   // It is optional because the business may NOT have twoStepApproval enabled
    },
    'approvals.$': {
        type: Object,
        optional: true
    },
    'approvals.$.approvalLabel': {
        type: String
    },
    'approvals.$.approvalLabelAlternative': {
        type: String,
        optional: true
    },
    'approvals.$.approvalUserId': {
        type: String
    },
    'approvals.$.approvalAlternativeUserId': {
        type: String,
        optional: true
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
