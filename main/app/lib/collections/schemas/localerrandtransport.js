/**
 * Trip Cost
 * 
 * An employee Jude wants to go from office to client office.
 * He opens this form on Bulkpay , fills it.
 * The form is sent to his supervisor with an email.
 * The supervisor can approve or reject.
 * Then the form is sent to the to the operation manager and he can also approve and reject.
 * Once he approves, the form is sent to the finance team. 
 * Flow ends 
 * That's the end flow for the form.
 */

Core.Schemas.LocalTripCosts = new SimpleSchema({
    accommodationCost: {
        type: Number,
        decimal: true,
        optional: true
    },
    localTransportCost: {
        type: Number,
        decimal: true,
        optional: true
    },
    perDiemCost: {
        type: Number,
        decimal: true,
        optional: true
    },
    roadCost: {
        type: Number,
        decimal: true,
        optional: true
    },
    miscCosts: {
        type: Number,
        decimal: true,
        optional: true
    }
});

/**
 * Travel Requisitions Schema
 */
Core.Schemas.LocalErrandTransport = new SimpleSchema({
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

    currency: {
        type: String,
        optional: true,
    },
    numberOfDays: {
        type: Number,
        optional: true,
    },
    costCenterCode: {
        type: String,
        optional: true,
    },

    fromLocation: {
        type: String,
        optional: true,
    },
    toLocation: {
        type: String,
        optional: true
    },
    departureDate: {
        type: Date,
        optional: true,
    },
    returnDate: {
        type: Date,
        optional: true
    },
    driverAssigned: {
        type: String,
        optional: true,
    },
    vehicleAssigned: {
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
        type: Core.Schemas.LocalTripCosts,
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
    supervisorId: {
        type: String,
        optional: true
    },
    alternativeSupervisorId: {
        type: String,
        optional: true
    },
    budgetHolderId: {
        type: String,
        optional: true
    },
    budgetHolderId: {
        type: String,
        optional: true
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
    'approvals.$.thirdApprover': {
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
