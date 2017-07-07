
/**
 * Travel Requisitions Schema
 */
Core.Schemas.TravelRequisition = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitId: {
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
        type: [Object],
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
