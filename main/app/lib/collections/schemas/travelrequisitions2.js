/**
* Trip Cost
*/

Core.Schemas.Trip = new SimpleSchema({
    tripIndex: {
        type: Number,
        optional: false,
        defaultValue: 1
    },
    fromId: {
        type: String,
        optional: true,
    },
    toId: {
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
    departureTime: {
        type: String,
        optional: true,
    },
    returnTime: {
        type: String,
        optional: true
    },
    transportationMode:{
        type: String,
        defaultValue: 'AIRLINE',
        allowedValues: ['AIRLINE', 'CAR', 'TRAIN'],
        optional: true
    },
    carOption:{
        type: String,
        defaultValue: 'CAR_HIRE',
        allowedValues: ['CAR_HIRE', 'OFFICE', 'THIRD_PARTY'],
        optional: true
    },
    provideAirportPickup:{
        type: Boolean,
        defaultValue: false
    },
    provideGroundTransport:{
        type: Boolean,
        defaultValue: false
    },
    originCityAirportTaxiCost:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    destinationCityAirportTaxiCost:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    groundTransportCost:{
        type: Number, decimal: true,
        defaultValue: 0
    },
    airlineId: {
        type: String,
        optional: true
    },
    airfareCost:{
        type:SimpleSchema.Integer,
        optional: true
    },
    airfareCurrency:{
        type: String,
        defaultValue: 'NGN',
        allowedValues: ['NGN', 'USD'],
        optional: true
    },
    hotelId: {
        type: String,
        optional: true
    },
    hotelRate:{
        type:SimpleSchema.Integer,
        optional: true
    },
    destinationCityCurrreny:{
        type: String,
        defaultValue: 'NGN',
        allowedValues: ['NGN', 'USD'],
        optional: true
    },
    hotelNotRequired:{
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    perDiemCost:{
        type:SimpleSchema.Integer
    },
    originCityCurrreny:{
        type: String,
        defaultValue: 'NGN',
        allowedValues: ['NGN', 'USD']
    },
    isBreakfastIncluded: {
        type: Boolean,
        defaultValue: true
    },
    isLunchIncluded: {
        type: Boolean,
        defaultValue: false
    },
    isDinnerIncluded: {
        type: Boolean,
        defaultValue: false
    },
    isIncidentalsIncluded: {
        type: Boolean,
        defaultValue: false
    },
    totalDuration:{
        type: Number, decimal: true,
        optional: true
    },
    totalPerDiem:{
        type:SimpleSchema.Integer,
        optional:true
    },
    totalHotelCost:{
        type:SimpleSchema.Integer,
        optional:true
    },
});

/**
* Travel Requisitions Schema
*/
Core.Schemas.TravelRequisition2 = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    description: {
        type: String
    },
    budgetCodeId: {
        type: String,
        optional: true
    },
    cashAdvanceNotRequired: {
        type: Boolean,
        defaultValue: false
    },
    type: {
        type: String,
        defaultValue: 'Return',
        allowedValues: ['Single', 'Return', 'Multiple']
    },
    totalTripDuration: {
        type: Number, decimal: true,
        optional: true
    },
    actualTotalTripDuration: {
        type: Number, decimal: true,
        defaultValue: 0,
        optional: true
    },
    totalEmployeePerdiemNGN: {
        type: Number, decimal: true,
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
    trips: {
        type: [Core.Schemas.Trip],
        optional: true,
    },
    status: {
        type: String,
        defaultValue: 'Pending',
        allowedValues: ["Cancelled","Draft","Pending","Approved By Supervisor", "Rejected By Supervisor","Approved By Budget Holder","Rejected By Budget Holder"],
        optional: true
    },
    retirementStatus: {
        type: String,
        defaultValue: 'Not Retired',
        allowedValues: ["Not Retired","Retirement Submitted","Retirement Approved By Supervisor", "Retirement Rejected By Supervisor","Retirement Approved Finance","Retirement Rejected Finance"],
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
    budgetHolderId: {
        type: String,
        optional: true
    },
    financeApproverId: {
        type: String,
        optional: true
    },
    supervisorComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    budgetHolderComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    additionalRetirementComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    tripReport: {
        type: String,
        defaultValue: '',
        optional: true
    },
    supervisorRetirementComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    budgetHolderRetirementComment: {
        type: String,
        defaultValue: '',
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
