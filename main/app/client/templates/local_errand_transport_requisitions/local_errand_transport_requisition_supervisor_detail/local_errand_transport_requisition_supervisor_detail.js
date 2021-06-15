
/*****************************************************************************/
/* LocalErrandTransportRequisitionSupervisorDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';





Template.LocalErrandTransportRequisitionSupervisorDetail.events({
    'click #approve': (e, tmpl) => {
        let supervisorComment = $('[name=supervisorComment]').val();
        let budgetCodeId =$('[name=budget-code]').val();

        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        currentLocalErrandTransportRequest.supervisorComment = supervisorComment;
        currentLocalErrandTransportRequest.budgetCodeId = budgetCodeId;
        currentLocalErrandTransportRequest.status = "Approved By Supervisor";

        currentLocalErrandTransportRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

        e.preventDefault()

        //update supervisorComment one last final time
        currentLocalErrandTransportRequest.supervisorComment = $("#supervisorComment").val();
        tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

        let fieldsAreValid = true;
        let validationErrors = '';

        /*** VALIDATIONS ***/
        //check that the description is not hello

        if (currentLocalErrandTransportRequest.supervisorComment ===""){
            fieldsAreValid = false;
            validationErrors += ": Supervisor Comment cannot be empty";
        }

        if( currentLocalErrandTransportRequest.budgetCodeId=="I am not sure")
        {
            fieldsAreValid = false;
            validationErrors += ": select a budget code";
        }
        if (fieldsAreValid){
            Meteor.call('LocalErrandTransportRequest2/supervisorApprovals', currentLocalErrandTransportRequest, (err, res) => {
                if (res){
                    swal({
                        title: "Local errand transport requisition has been updated",
                        text: "Employee travel requisition has been updated,notification has been sent to the necessary parties",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Local errand transport requisition has  not been updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }
            });
            Template.instance().errorMessage.set(null);
            Modal.hide('LocalErrandTransportRequisitionCreate');
        }else{
            Template.instance().errorMessage.set("Validation errors" + validationErrors);
        }

    },



    'click #reject': (e, tmpl) => {
        let supervisorComment = $('[name=supervisorComment]').val();
        let budgetCodeId =$('[name=budget-code]').val();

        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        currentLocalErrandTransportRequest.supervisorComment = supervisorComment;
        currentLocalErrandTransportRequest.budgetCodeId = budgetCodeId;
        currentLocalErrandTransportRequest.status = "Rejected By Supervisor";

        currentLocalErrandTransportRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

        e.preventDefault()

        //update supervisorComment one last final time
        currentLocalErrandTransportRequest.supervisorComment = $("#supervisorComment").val();
        tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

        let fieldsAreValid = true;
        let validationErrors = '';

        /*** VALIDATIONS ***/
        //check that the description is not hello

        if (currentLocalErrandTransportRequest.supervisorComment ===""){
            fieldsAreValid = false;
            validationErrors += ": Supervisor Comment cannot be empty";
        }

        if( currentLocalErrandTransportRequest.budgetCodeId=="I am not sure")
        {
            fieldsAreValid = false;
            validationErrors += ": select a budget code";
        }
        if (fieldsAreValid){

            Meteor.call('LocalErrandTransportRequest2/supervisorApprovals', currentLocalErrandTransportRequest, (err, res) => {
                if (res){
                    swal({
                        title: "Local errand transport requisition has been rejected",
                        text: "Employee local errand transport requisition has been rejected,notification has been sent to the necessary parties",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Local errand transport requisition has  not been updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }
            });
            Template.instance().errorMessage.set(null);
            Modal.hide('LocalErrandTransportRequisitionSupervisorDetail');
        }else{
            Template.instance().errorMessage.set("Validation errors" + validationErrors);
        }

    },
    'change [id=budget-code]': function(e, tmpl) {
        e.preventDefault()

        console.log("budget codexxx");
        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        currentLocalErrandTransportRequest.budgetCodeId = $("#budget-code").val();
        tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionSupervisorDetail: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionSupervisorDetail.helpers({
    'errorMessage': function() {
        return Template.instance().errorMessage.get()
    },
    travelTypeChecked(val){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val){
            return currentLocalErrandTransportRequest.type === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentLocalErrandTransportRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();

        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();

        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    cashAdvanceNotRequiredChecked(){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest){
            return currentLocalErrandTransportRequest.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index){
            return currentLocalErrandTransportRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },
    isLastLeg(index){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && index && currentLocalErrandTransportRequest.type ==="Multiple"){
            return parseInt(index) >= currentLocalErrandTransportRequest.trips.length;
        }
    },
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        }
    },
    budgetList() {
        return  Budgets.find();
    },
    budgetCodeSelected(val){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest && val){
            return currentLocalErrandTransportRequest.budgetCodeId === val ? selected="selected" : '';
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
    'currentLocalErrandTransportRequest': function() {
        return Template.instance().currentLocalErrandTransportRequest.get()
    },
    'getEmployeeNameById': function(employeeId){
        return Meteor.users.findOne({_id: employeeId}).profile.fullName;
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
    'getPrintUrl': function(currentLocalErrandTransportRequest) {
        if(currentLocalErrandTransportRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/localerrandtransportrequests/printrequisition?requisitionId=' + currentLocalErrandTransportRequest._id
        }
    }
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionSupervisorDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionSupervisorDetail.onCreated(function () {


    let self = this;
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));




    self.currentLocalErrandTransportRequest = new ReactiveVar()
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
        let travelRequest2Sub = self.subscribe('LocalErrandTransportRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = LocalErrandTransportRequisitions.findOne({_id: invokeReason.requisitionId})
            self.currentLocalErrandTransportRequest.set(travelRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.LocalErrandTransportRequisitionSupervisorDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentLocalErrandTransportRequest = self.currentLocalErrandTransportRequest.get()
    if(currentLocalErrandTransportRequest) {
        if(currentLocalErrandTransportRequest.status !== 'Draft' && currentLocalErrandTransportRequest.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentLocalErrandTransportRequest.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentLocalErrandTransportRequest.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.LocalErrandTransportRequisitionSupervisorDetail.onDestroyed(function () {
});
