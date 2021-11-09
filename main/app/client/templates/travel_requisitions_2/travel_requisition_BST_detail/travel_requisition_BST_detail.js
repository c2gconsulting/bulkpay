
/*****************************************************************************/
/* TravelRequisition2BSTDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2BSTDetail.events({
    'click #processTrip': (e, tmpl) => {
        let supervisorComment = $('[name=supervisorComment]').val();
        let budgetCodeId =$('[name=budget-code]').val();

        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.supervisorComment = supervisorComment;
        currentTravelRequest.budgetCodeId = budgetCodeId;
        currentTravelRequest.status = Core.ALL_TRAVEL_STATUS.PROCESSED_BY_BST;

        currentTravelRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

        e.preventDefault()

        //update supervisorComment one last final time
        // currentTravelRequest.supervisorComment = $("#supervisorComment").val();
        tmpl.currentTravelRequest.set(currentTravelRequest);

        let fieldsAreValid = true;
        let validationErrors = '';

        /*** VALIDATIONS ***/
        //check that the description is not hello

        if( currentTravelRequest.budgetCodeId=="I am not sure")
        {
            fieldsAreValid = false;
            validationErrors += ": select a budget code";
        }
        if (fieldsAreValid){
            const processed = true
            currentTravelRequest.isProcessedByBST = true
            Meteor.call('TRIPREQUEST/bstProcess', currentTravelRequest, 'BST', '', processed, (err, res) => {
                if (res){
                    swal({
                        title: "Travel requisition has been updated",
                        text: "Employee travel requisition has been updated,notification has been sent to the necessary parties",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Travel requisition has  not been updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }
            });
            Template.instance().errorMessage.set(null);
            Modal.hide('TravelRequisition2Create');
        }else{
            swal({
                title: "Oops!",
                text: "Validation errors" + validationErrors,
                confirmButtonClass: "btn-danger",
                type: "error",
                confirmButtonText: "OK"
            });
            Template.instance().errorMessage.set("Validation errors" + validationErrors);
        }

    },
    'change [id=budget-code]': function(e, tmpl) {
        e.preventDefault()

        console.log("budget codexxx");
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.budgetCodeId = $("#budget-code").val();
        tmpl.currentTravelRequest.set(currentTravelRequest);

    },
    "click [id*='provideSecurity']": function(e, tmpl){
    
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
    
        currentTravelRequest.trips[index].provideSecurity = !currentTravelRequest.trips[index].provideSecurity;
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    'change [id=additionalSecurityComment]': function(e, tmpl) {
      e.preventDefault()
    
      let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    
      currentTravelRequest.additionalSecurityComment = $("#additionalSecurityComment").val();
      tmpl.currentTravelRequest.set(currentTravelRequest);
    
    },
    "change [id*='driverInfo']": function(e, tmpl){
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
        currentTravelRequest.trips[index].driverInformation = $(e.currentTarget).val();

        const ddriver = Meteor.users.findOne({_id: currentTravelRequest.trips[index].driverInformation });
        if (ddriver && ddriver.employeeProfile) {
            const employeeProfile = ddriver.employeeProfile && ddriver.employeeProfile.payment;
            currentTravelRequest.trips[index].accountNumber = employeeProfile.accountNumber
            currentTravelRequest.trips[index].bankName = employeeProfile.bank
        }

        console.log('currentTravelRequest.trips[index].driverInformation', currentTravelRequest.trips[index].driverInformation)
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    "change [id*='accountInfo']": function(e, tmpl){
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
    
        currentTravelRequest.trips[index].accountNumber = $(e.currentTarget).val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    "change [id*='vehicleInfo']": function(e, tmpl){
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
    
        currentTravelRequest.trips[index].vehicleInformation = $(e.currentTarget).val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    "change [id*='driverCost']": function(e, tmpl){
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
  
        currentTravelRequest.trips[index].driverCost = $(e.currentTarget).val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    "change [id*='bankInfo']": function(e, tmpl){
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        const index = ($(e.currentTarget).attr("id").substr($(e.currentTarget).attr("id").length - 1)) - 1;
    
        currentTravelRequest.trips[index].bankName = $(e.currentTarget).val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
    'change [id=costCenter]': function(e, tmpl) {
        e.preventDefault()
    
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.costCenter = $("#costCenter").val();
        tmpl.currentTravelRequest.set(currentTravelRequest);
    },
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisition2BSTDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisition2BSTDetail.helpers({
    ACTIVITY: () => 'activityId',
    COSTCENTER: () => 'costCenter',
    PROJECT_AND_DEPARTMENT: () => 'departmentOrProjectId',
    costCenters: () => Core.Travel.costCenters,
    carOptions: () => Core.Travel.carOptions,
    currentDepartment: () => Template.instance().currentDepartment.get(),
    currentProject: () =>Template.instance().currentProject.get(),
    currentActivity: () => Template.instance().currentActivity.get(),
    isEmergencyTrip () {
        // let index = this.tripIndex - 1;
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        const minDate = new Date(moment(new Date()).add(5, 'day').format());
        const isEmergencyTrip = currentTravelRequest.isEmergencyTrip;

        return isEmergencyTrip ? new Date() : minDate;
    },
    costCenterType: function (item) {
      const currentTravelRequest = Template.instance().currentTravelRequest.get();
      if (currentTravelRequest && currentTravelRequest.costCenter === item) return item
      return false
    },
    selected(context,val) {
        let self = this;
        const { currentTravelRequest } = Template.instance();

        if(currentTravelRequest){
            //get value of the option element
            //check and return selected if the template instce of data.context == self._id matches
            if(val){
                return currentTravelRequest[context] === val ? selected="selected" : '';
            }
            return currentTravelRequest[context] === self._id ? selected="selected" : '';
        }
    },
    checkbox(isChecked){
        console.log('isChecked', isChecked)
        return isChecked ? checked="checked" : checked="";
    },
    'errorMessage': function() {
        return Template.instance().errorMessage.get()
    },
    cannotApprove() {
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        const { BST } = Core.Approvals;
        return !Core.canApprove(BST, currentTravelRequest)
    },
    provideSecurity(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideSecurity? checked="checked" : '';
        }
    },
    needSecurity(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideSecurity? true : false;
        }
    },
    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
        }
    },
    destinationTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.destinationType === val ? checked="checked" : '';
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
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIR"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    costCenters() {
        console.log("Session.get('context');", Session.get('context'))
        return CostCenters.find({ businessId: Session.get('context') });
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
    cashAdvanceNotRequiredChecked(){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest){
            return currentTravelRequest.cashAdvanceNotRequired? checked="checked" : '';
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
            // return parseInt(index) >= currentTravelRequest.trips.length;
            return parseInt(index) >= currentTravelRequest.trips.length + 1;
        }
    },
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        } 
        return travelcityId
    },
    budgetList() {
        return  Budgets.find();
    },
    driverInfoSelected(val, index) {
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val && index){
            return currentTravelRequest.trips[parseInt(index) - 1].driverInformation === val ? selected="selected" : '';
        }
    },
    budgetCodeSelected(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.budgetCodeId === val ? selected="selected" : '';
        }
    },

    'getHotelName': function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
        return hotelId
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
    'employees': () => {
      return Meteor.users.find({employee: true});
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
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }
});

/*****************************************************************************/
/* TravelRequisition2BSTDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2BSTDetail.onCreated(function () {


    let self = this;
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));
    self.subscribe("costcenters", Session.get('context'));




    self.currentTravelRequest = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()
    self.isInRetireMode = new ReactiveVar()

    self.currentDepartment = new ReactiveVar()
    self.currentProject = new ReactiveVar()
    self.currentActivity = new ReactiveVar()

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
            Core.defaultDepartmentAndProject(self, travelRequestDetails)

            if (travelRequestDetails) {
                travelRequestDetails.trips.map(({ tripIndex, driverInformation}) => {
                    $(`#driverInfo_${tripIndex}`).dropdown('set selected', driverInformation);
                })
            }


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequisition2BSTDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTravelRequest = self.currentTravelRequest.get()
    if(currentTravelRequest) {
        const draft = Core.ALL_TRAVEL_STATUS.DRAFT;
        const pending = Core.ALL_TRAVEL_STATUS.PENDING;

        if(currentTravelRequest.status !== draft && currentTravelRequest.status !== pending) {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentTravelRequest.status === pending) {
            self.isInViewMode.set(true)
        } else if(currentTravelRequest.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TravelRequisition2BSTDetail.onDestroyed(function () {
});
