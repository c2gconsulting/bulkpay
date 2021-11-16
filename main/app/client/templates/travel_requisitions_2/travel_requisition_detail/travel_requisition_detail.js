
/*****************************************************************************/
/* TravelRequisition2Detail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisition2Detail: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Detail.helpers({
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
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
    },
    travelApprovals: function () {
        let isAirTransportationMode = false;
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        
        const { trips, destinationType } = currentTravelRequest;
        const isInternationalTrip = destinationType === 'International';
        for (let i = 0; i < trips.length; i++) {
            const { transportationMode } = trips[i];
            if (transportationMode == 'AIR') isAirTransportationMode = true
        }

        const shouldGotoLogisicsFirst = (!isAirTransportationMode && !isInternationalTrip);

        const { supervisorId, managerId, budgetHolderId, gcooId, gceoId, logisticsId, bstId } = currentTravelRequest;
        const { HOD, BUDGETHOLDER, MD, GCOO, GCEO, BST, LOGISTICS } = Core.Approvals

        const LOGISTICS_LABEL = { approvalId: logisticsId, label: LOGISTICS };
        const BST_LABEL = { approvalId: bstId, label: BST };

        const NEXT_APPROVAL_LABEL = shouldGotoLogisicsFirst ? LOGISTICS_LABEL : BST_LABEL;
        const SECOND_NEXT_APPROVAL_LABEL = shouldGotoLogisicsFirst ? BST_LABEL : LOGISTICS_LABEL;

        const dApprovals = [
            { approvalId: budgetHolderId, label: BUDGETHOLDER },
            { approvalId: supervisorId, label: HOD },
            { approvalId: managerId, label: MD },
            { approvalId: gcooId, label: GCOO },
            { approvalId: gceoId, label: GCEO },
            NEXT_APPROVAL_LABEL,
            SECOND_NEXT_APPROVAL_LABEL,
            // { approvalId: bstId, label: BST },
            // { approvalId: logisticsId, label: LOGISTICS },
        ]
        return dApprovals;
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
/* TravelRequisition2Detail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2Detail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("allEmployees", Session.get('context'));

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


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequisition2Detail.onRendered(function () {
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

Template.TravelRequisition2Detail.onDestroyed(function () {
});
