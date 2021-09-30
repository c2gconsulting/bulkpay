/**
* Trip created on behalf of client
*/
Core.Schemas.Individual = new SimpleSchema({
    id: {
        type: String,
        optional: true,
    },
    fullName: {
        type: String,
        optional: false,
    },
    firstname: {
        type: String,
        optional: false,
    },
    lastname: {
        type: String,
        optional: false,
    },
    email: {
        type: String,
        optional: false,
    },
});

/**
* Trip created on behalf of 
*/
Core.Schemas.CreatedOnBehalf = new SimpleSchema({
    noOfIndividuals: {
        type: Number,
        optional: false,
        defaultValue: 1
    },
    individuals: {
        type: [Core.Schemas.Individual],
        optional: true
    }
});

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
        defaultValue: 'AIR',
        allowedValues: ['AIR', 'LAND'],
        optional: true
    },
    provideSecurity: {
        type: Boolean,
        defaultValue: false
    },
    driverInformation: {
        type: String,
        optional: true
    },
    vehicleInformation: {
        type: String,
        optional: true
    },
    accountNumber: {
        type: String,
        optional: true
    },
    bankName: {
        type: String,
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
    costCenter: {
        type: String,
        defaultValue: 'Project',
        allowedValues: ['Project', 'Department']
    },
    tpcTrip: {
        type: String,
        defaultValue: 'Third_Party',
        allowedValues: ['Third_Party', 'Client']
    },
    destinationType: {
        type: String,
        defaultValue: 'Local',
        allowedValues: ['Local', 'International']
    },
    tripFor: {
        type: Core.Schemas.CreatedOnBehalf,
        optional: true,
    },
    tripCategory: {
        type: String,
        defaultValue: 'INDIVIDUAL',
        allowedValues: ['INDIVIDUAL', 'GROUP', 'THIRD_PARTY_CLIENT']
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
    totalSecurityCostNGN: {
        type: Number, decimal: true,
        optional: true
    },
    totalSecurityCostUSD: {
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
        allowedValues: ["Cancelled","Draft","Pending","Approved by HOD", "Rejected By HOD","Approved By MD","Rejected By MD", "Approved By GCOO","Rejected By GCOO", "Approved By GCEO","Rejected By GCEO", "Processed By Logistics", "Processed By BST"],
        optional: true
    },
    retirementStatus: {
        type: String,
        defaultValue: 'Not Retired',
        allowedValues: ["Not Retired","Draft","Retirement Submitted","Retirement Approved", "Rejected"],
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
    managerId: {
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
    gcooId: {
        type: String,
        optional: true
    },
    gceoId: {
        type: String,
        optional: true
    },
    bstId: {
        type: String,
        optional: true
    },
    logisticsId: {
        type: String,
        optional: true
    },
    bstComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    logisticsComment: {
        type: String,
        defaultValue: '',
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
    managerComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    gcooComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    gceoComment: {
        type: String,
        defaultValue: '',
        optional: true
    },
    additionalSecurityComment: {
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
    isProcessedByBST: {
        type: Boolean,
        defaultValue: false,
        optional: true
    },
    isProcessedByLogistics: {
        type: Boolean,
        defaultValue: false,
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
