

Core.Schemas.offShoreWeek = new SimpleSchema({
    monday:{
        type: Boolean,
        defaultValue: false
    },
    tuesday:{
        type: Boolean,
        defaultValue: false
    },
    wednesday:{
        type: Boolean,
        defaultValue: false
    },
    thursday:{
        type: Boolean,
        defaultValue: false
    },
    friday:{
        type: Boolean,
        defaultValue: false
    },
    saturday:{
        type: Boolean,
        defaultValue: false
    },
    sunday:{
        type: Boolean,
        defaultValue: false
    }
});
Core.Schemas.onShoreWeek = new SimpleSchema({
    monday:{
        type: Boolean,
        defaultValue: false
    },
    tuesday:{
        type: Boolean,
        defaultValue: false
    },
    wednesday:{
        type: Boolean,
        defaultValue: false
    },
    thursday:{
        type: Boolean,
        defaultValue: false
    },
    friday:{
        type: Boolean,
        defaultValue: false
    },
    saturday:{
        type: Boolean,
        defaultValue: false
    },
    sunday:{
        type: Boolean,
        defaultValue: false
    }
});

Core.Schemas.Vehicle = new SimpleSchema({
    vehicleWeekIndex: {
        type: Number,
        optional: false,
        defaultValue: 1
    },
    monday:{
        type: Boolean,
        defaultValue: false
    },
    tuesday:{
        type: Boolean,
        defaultValue: false
    },
    wednesday:{
        type: Boolean,
        defaultValue: false
    },
    thursday:{
        type: Boolean,
        defaultValue: false
    },
    friday:{
        type: Boolean,
        defaultValue: false
    },
    saturday:{
        type: Boolean,
        defaultValue: false
    },
    sunday:{
        type: Boolean,
        defaultValue: false
    }
});

Core.Schemas.Period = new SimpleSchema({
  weekIndex: {
      type: Number,
      optional: false,
      defaultValue: 1
  },
    year: {
      type: String,
      optional: true

    },
    month:{
      type: String,
      optional: true

    }
});


Core.Schemas.TimeRecord = new SimpleSchema({

    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    projectCode: {
        type: String
    },
    chargeCode: {
        type: String,
        optional: true
    },
    totalDaysWorked: {
        type: Number,
        optional: true
    },
    totalDaysWorkedOnshore: {
        type: Number,
        defaultValue: 0,
        optional: true
    },
    totalDaysWorkedOffshore: {
        type: Number,
        optional: true
    },

    period: {
        type: Core.Schemas.Period,
        optional: true,
    },
    onShoreWeek: {
        type: Core.Schemas.onShoreWeek,
        optional: true,
    },
    offShoreWeek: {
        type: Core.Schemas.offShoreWeek,
        optional: true,
    },
    vehicle: {
        type: Core.Schemas.Vehicle,
        optional: true,
    },
    status: {
        type: String,
        defaultValue: 'Pending',
        allowedValues: ["Cancelled","Draft","Pending","Approved By Supervisor", "Rejected By Supervisor"],
        optional: true
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
