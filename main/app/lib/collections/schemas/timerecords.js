

Core.Schemas.Week = new SimpleSchema({
    weekIndex: {
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
    year: {
      type: String
    },
    month:{
      type: String
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
    totalEmployeePerdiemUSD: {
        type: Number, decimal: true,
        optional: true
    },
    totalAirportTaxiCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalAirportTaxiCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalGroundTransportCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalGroundTransportCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalMiscCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalMiscCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalEmployeePerdiemNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalEmployeePerdiemUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalAirportTaxiCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalAirportTaxiCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalGroundTransportCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalGroundTransportCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalMiscCostNGN:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    actualTotalMiscCostUSD:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    totalFlightCostNGN: {
        type: Number, decimal: true,
        optional: true
    },
    totalFlightCostUSD: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalHotelCostNGN: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalHotelCostUSD: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalTripCostNGN: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalTripCostUSD: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalAncilliaryCostNGN: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    totalAncilliaryCostUSD: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    actualTotalAncilliaryCostNGN: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    actualTotalAncilliaryCostUSD: {
        type: Number, decimal: true,
        optional: true,
        defaultValue: 0
    },
    period: {
        type: Core.Schemas.Period,
        optional: true,
    },
    week: {
        type: Core.Schemas.Week,
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
