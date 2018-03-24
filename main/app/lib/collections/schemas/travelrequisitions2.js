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
        type: Number,
        defaultValue: 0
    },
    destinationCityAirportTaxiCost:{
        type: Number,
        defaultValue: 0
    },
    groundTransportCost:{
        type: Number,
        defaultValue: 0
    },
    airlineId: {
        type: String,
        optional: true
    },
    airfareCost:{
        type:Number,
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
        type:Number,
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
        type:Number
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
        type: Number,
        optional: true
    },
    totalPerDiem:{
        type:Number,
        optional:true
    },
    totalHotelCost:{
        type:Number,
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
        type: Number,
        optional: true
    },
    totalEmployeeAmountPayableNGN: {
        type: Number,
        optional: true
    },
    totalEmployeeAmountPayableUSD: {
        type: Number,
        optional: true
    },
    totalFlightCostNGN: {
        type: Number,
        optional: true
    },
    totalFlightCostUSD: {
        type: Number,
        optional: true
    },
    totalHotelCostNGN: {
        type: Number,
        optional: true
    },
    totalHotelCostUSD: {
        type: Number,
        optional: true
    },
    totalTripCostNGN: {
        type: Number,
        optional: true
    },
    totalTripCostUSD: {
        type: Number,
        optional: true
    },
    trips: {
        type: [Core.Schemas.Trip],
        optional: true,
    },
    status: {
        type: String,
        defaultValue: 'Pending',
        allowedValues: ["Pending","Approved By Supervisor", "Rejected By Supervisor","Approved By BudgetHolder","Rejected By BudgetHolder"],
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
