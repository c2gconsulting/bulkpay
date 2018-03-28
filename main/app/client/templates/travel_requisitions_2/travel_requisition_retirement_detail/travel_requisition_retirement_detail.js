
/*****************************************************************************/
/* TravelRequisition2RetirementDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2RetirementDetail.events({
    'change ': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;

        currentTravelRequest.actualTotalTripDuration = parseFloat(($("#actualTotalTripDuration").val()).replace(',',''));
        currentTravelRequest.actualTotalTripDuration = isNaN(currentTravelRequest.actualTotalTripDuration)?0:currentTravelRequest.actualTotalTripDuration;

        currentTravelRequest.actualTotalEmployeePerdiemNGN = parseFloat(($("#actualTotalEmployeePerdiemNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalEmployeePerdiemNGN = isNaN(currentTravelRequest.actualTotalEmployeePerdiemNGN)?0:currentTravelRequest.actualTotalEmployeePerdiemNGN;

        currentTravelRequest.actualTotalEmployeePerdiemUSD = parseFloat(($("#actualTotalEmployeePerdiemUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalEmployeePerdiemUSD = isNaN(currentTravelRequest.actualTotalEmployeePerdiemUSD)?0:currentTravelRequest.actualTotalEmployeePerdiemUSD;

        currentTravelRequest.actualTotalAirportTaxiCostNGN = parseFloat(($("#actualTotalAirportTaxiCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalAirportTaxiCostNGN = isNaN(currentTravelRequest.actualTotalAirportTaxiCostNGN)?0:currentTravelRequest.actualTotalAirportTaxiCostNGN;

        currentTravelRequest.actualTotalGroundTransportCostNGN = parseFloat(($("#actualTotalGroundTransportCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalGroundTransportCostNGN = isNaN(currentTravelRequest.actualTotalGroundTransportCostNGN)?0:currentTravelRequest.actualTotalGroundTransportCostNGN;

        currentTravelRequest.actualTotalMiscCostNGN = parseFloat(($("#actualTotalMiscCostNGN").val()).replace(',',''));
        currentTravelRequest.actualTotalMiscCostNGN = isNaN(currentTravelRequest.actualTotalMiscCostNGN)?0:currentTravelRequest.actualTotalMiscCostNGN;

        currentTravelRequest.actualTotalAirportTaxiCostUSD = parseFloat(($("#actualTotalAirportTaxiCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalAirportTaxiCostUSD = isNaN(currentTravelRequest.actualTotalAirportTaxiCostUSD)?0:currentTravelRequest.actualTotalAirportTaxiCostUSD;

        currentTravelRequest.actualTotalGroundTransportCostUSD = parseFloat(($("#actualTotalGroundTransportCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalGroundTransportCostUSD = isNaN(currentTravelRequest.actualTotalGroundTransportCostUSD)?0:currentTravelRequest.actualTotalGroundTransportCostUSD;

        currentTravelRequest.actualTotalMiscCostUSD = parseFloat(($("#actualTotalMiscCostUSD").val()).replace(',',''));
        currentTravelRequest.actualTotalMiscCostUSD = isNaN(currentTravelRequest.actualTotalMiscCostUSD)?0:currentTravelRequest.actualTotalMiscCostUSD;

        currentTravelRequest.actualTotalAncilliaryCostNGN = currentTravelRequest.actualTotalEmployeePerdiemNGN + currentTravelRequest.actualTotalAirportTaxiCostNGN + currentTravelRequest.actualTotalGroundTransportCostNGN + currentTravelRequest.actualTotalMiscCostNGN;
        currentTravelRequest.actualTotalAncilliaryCostUSD = currentTravelRequest.actualTotalEmployeePerdiemUSD + currentTravelRequest.actualTotalAirportTaxiCostUSD + currentTravelRequest.actualTotalGroundTransportCostUSD + currentTravelRequest.actualTotalMiscCostUSD;
        currentTravelRequest.additionalRetirementComment = $("#additionalRetirementComment").val();


        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    'click #new-retirement-create': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.retirementStatus = "Retirement Submitted";
        Meteor.call('TravelRequest2/retire', currentTravelRequest, (err, res) => {
            if (res){
                swal({
                    title: "Trip Retirement Updated",
                    text: "Your trip requirement has been made, a notification has been sent to your supervisor",
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal({
                    title: "Oops!",
                    text: "Your trip requirement could not be created, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }
        });

    },
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisition2RetirementDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisition2RetirementDetail.helpers({

    checkWhoToRefund(currency){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        let formatNumber = function(numberVariable, n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }

        if (currency === "USD"){
            const usdDifference = currentTravelRequest.totalAncilliaryCostUSD - currentTravelRequest.actualTotalAncilliaryCostUSD;
            if (usdDifference > 0){
                return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
            }else if (usdDifference < 0){
                return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
            }else{
                return "No USD refunds"
            }
        }else if (currency === "NGN"){
            const ngnDifference = currentTravelRequest.totalAncilliaryCostNGN - currentTravelRequest.actualTotalAncilliaryCostNGN;
            if (ngnDifference > 0){
                return "Employee to refund " + formatNumber(ngnDifference,2) + " NGN";
            }else if (ngnDifference < 0){
                return "Company to refund " + formatNumber((-1 * ngnDifference),2) + " NGN";
            }else{
                return "No NGN refunds"
            }
        }
    },
    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTravelRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
        }
    },
    'getEmployeeNameById': function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    },

    isBreakfastIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },
    isLastLeg(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index && currentTravelRequest.type ==="Multiple"){
            return parseInt(index) >= currentTravelRequest.trips.length;
        }
    },
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        }
    },
    'getHotelName': function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
    },
    'getAirlineName': function(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})

        if(airline) {
            return airline.name
        }
    },
    'getBudgetName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    },
    'currentTravelRequest': function() {
        return Template.instance().currentTravelRequest.get()
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    cashAdvanceNotRequiredChecked(){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest){
            return currentTravelRequest.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    'isInEditMode': function() {
        return Template.instance().isInEditMode.get()
    },
    'isInApproveMode': function() {
        return Template.instance().isInApproveMode.get()
    },
    'isInApproverEditMode': function() {
        return Template.instance().isInApproverEditMode.get()
    },
    'isInTreatMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'isInRetireMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'getUnitName': function(unitId) {
        if(unitId) {
            console.log(`unit id: `, unitId)
            return EntityObjects.findOne({_id: unitId}).name
        }
    },

    'getHumanReadableApprovalState': function(boolean) {
        return boolean ? "Approved" : "Rejected"
    },
    'or': (a, b) => {
        return a || b
    },
    'isEqual': (a, b) => {
        return a === b;
    },


    'totalTripCostNGN': function() {
        return Template.instance().totalTripCostNGN.get()
    },
});

/*****************************************************************************/
/* TravelRequisition2RetirementDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2RetirementDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));




    self.currentTravelRequest = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()
    self.isInRetireMode = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

    let invokeReason = self.data;

    // self.totalTripCost = new ReactiveVar(0)
    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    if(invokeReason.reason === 'edit') {
        self.isInEditMode.set(true)
    }
    if(invokeReason.reason === 'approve') {
        self.isInApproveMode.set(true)
    }
    if(invokeReason.reason === 'treat') {
        self.isInTreatMode.set(true)
    }
    if(invokeReason.reason === 'retire') {
        self.isInRetireMode.set(true)
    }

    self.businessUnitLogoUrl = new ReactiveVar()

    self.autorun(function() {

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, customConfig) {
            if(!err) {
                self.businessUnitCustomConfig.set(customConfig)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId})
            self.currentTravelRequest.set(travelRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequisition2RetirementDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTravelRequest = self.currentTravelRequest.get()
    if(currentTravelRequest) {
        if(currentTravelRequest.status !== 'Draft' && currentTravelRequest.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentTravelRequest.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentTravelRequest.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TravelRequisition2RetirementDetail.onDestroyed(function () {
});
