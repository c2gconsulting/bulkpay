/**
 * Trip Cost
 */

Core.Schemas.TripCosts = new SimpleSchema({
    flightCost: {
        type: Number,
        decimal: true
    },
    accommodationCost: {
        type: Number,
        decimal: true
    },
    localTransportCost: {
        type: Number,
        decimal: true
    },
    perDiemCost: {
        type: Number,
        decimal: true
    },
    miscCosts: {
        type: Number,
        decimal: true
    }
});

/**
 * Travel Requisitions Schema
 */
Core.Schemas.TravelRequisition = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    description: {
        type: String,
        optional: true,
    },
    dateRequired: {
        type: Date,
        optional: true
    },
    unitId: {
        type: String,
        optional: true
    },
    requisitionReason: {
        type: String,
        optional: true
    },
    tripCosts: {
        type: Core.Schemas.TripCosts,
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Draft'     //Draft or Pending or Treated or Rejected
    },
    isStatusSeenByCreator: {
        type: Boolean,
        defaultValue: false
    },
    createdBy: {
        type: String
    },
    supervisorPositionId: {
        type: String,
        optional: true
    },
    alternativeSupervisorPositionId: {
        type: String,
        optional: true
    },
    'approvals': {
        type: [Object],
        optional: true   // It is optional because the business may NOT have twoStepApproval enabled
    },
    'approvals.$': {
        type: Object,
        optional: true
    },
    'approvals.$.approverUserId': {
        type: String
    },
    'approvals.$.firstApprover': {
        type: Boolean
    },
    'approvals.$.secondApprover': {
        type: Boolean
    },
    'approvals.$.approvalStatus': {
        type: Boolean
    },
    'approvals.$.approvalRecommendation': {
        type: String,
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
