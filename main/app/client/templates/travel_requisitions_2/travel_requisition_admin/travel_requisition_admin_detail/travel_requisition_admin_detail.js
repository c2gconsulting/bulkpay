
/*****************************************************************************/
/* TravelRequisition2AdminDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';


Template.TravelRequisition2AdminDetail.events({

    'click #requisition-cancel': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;


        let fieldsAreValid = true;
        let validationErrors = '';

        /*** VALIDATIONS ***/
        //check that the description is not hello

        if (currentTravelRequest.retirementStatus !=="Not Retired"){
            fieldsAreValid = false;
            validationErrors += ": Travel Request cannot be cancelled because it has been retired";
        }


        if (fieldsAreValid){
            //explicitely set status
            //currentTravelRequest.status = "Cancelled";

            Meteor.call('TravelRequest2/cancelTravel', currentTravelRequest, (err, res) => {
                if (res){
                    swal({
                        title: "Travel requisition created",
                        text: "Travel request has been cancelled",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Travel request could not be cancelled, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }

            });
            Template.instance().errorMessage.set(null);
            Modal.hide('TravelRequisition2AdminDetail');
        }else{
            Template.instance().errorMessage.set("Validation errors" + validationErrors);
        }

    }
});

Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisition2AdminDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisition2AdminDetail.helpers({
    'errorMessage': function() {
        return Template.instance().errorMessage.get()
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
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    // 'getEmployeeNameById': function(employeeId){
    //     return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    // },

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
    cashAdvanceNotRequiredChecked(){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest){
            return currentTravelRequest.cashAdvanceNotRequired? checked="checked" : '';
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
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }
});

/*****************************************************************************/
/* TravelRequisition2AdminDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2AdminDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));


    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

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

Template.TravelRequisition2AdminDetail.onRendered(function () {
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

Template.TravelRequisition2AdminDetail.onDestroyed(function () {
});
