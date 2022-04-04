
/*****************************************************************************/
/* TravelRequisition2Print: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';


Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisition2Print: Helpers */
/*****************************************************************************/
Template.TravelRequisition2Print.helpers({
  travelTypeChecked(val){
    const currentTravelRequest = Template.instance().currentTravelRequest.get();
    if(currentTravelRequest && val){
      return currentTravelRequest.type === val ? checked="checked" : '';
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
  destinationTypeChecked(val){
      const currentTravelRequest = Template.instance().currentTravelRequest.get();
      if(currentTravelRequest && val){
          return currentTravelRequest.destinationType === val ? checked="checked" : '';
      }
  },
  'getEmployeeFullName': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
    return employee.profile.fullName;
    else
    return ""
  },
  'getBudgetHolderNames': function(budgetCodeId) {
    const budget = Budgets.findOne({_id: budgetCodeId})

    if(budget) {
      let employeeId = budget.employeeId
      let employee = Meteor.users.findOne({_id: employeeId});
      if(employee)
      return employee.profile.fullName;
      else
      return "..."
    }
  },
  'getEmployeeEmail': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
    return employee.emails[0].address;
    else
    return "..."
  },
  'getEmployeePhoneNumber': function(employeeId) {
    let employee = Meteor.users.findOne({_id: employeeId});
    if(employee)
    return employee.employeeProfile.phone;
    else
    return "..."
  },
  // 'getEmployeeNameById': function(employeeId){
  //         return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
  // },


  attachments: function () {
    // Meteor.Attachment.find({ })
    console.log('instance()', Template.instance())
    console.log('Template.instance()()', Template.instance().data)
    const requisitionId = Template.instance().currentTravelRequest.get()._id
    console.log('requisitionId', requisitionId)
    const attachments = Attachments.find({ travelId: requisitionId })
    console.log('attachments', attachments)
    return attachments;
  },
  getAttachmentName: function (data) {
    return data.name || data.fileUrl || data.imageUrl
  },
  
  getAttachmentUrl: function (data) {
    return data.fileUrl || data.imageUrl
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
  'getTravelcityName': function(travelcityId, country) {
    const travelcity = Travelcities.findOne({_id: travelcityId})

    if(travelcity) {
      return travelcity.name
    }
  },
  'getHotelName': function(hotelId) {
    // const currentTravelRequest = Template.instance().currentTravelRequest.get();
    // if(currentTravelRequest && hotelId){
    //   let index = currentTravelRequest.trips.tripIndex
    //     return currentTravelRequest.trips.hotelId;
    // }
    const hotel = Hotels.findOne({_id: hotelId})

    if(hotel) {
      return hotel.name
    }
    return hotelId || 'I do not need a Hotel'
  },

  'getBudgetName': function(budgetCodeId) {
    // const currentTravelRequest = Template.instance().currentTravelRequest.get();
    // if(currentTravelRequest && budgetCodeId){
    //     return currentTravelRequest.budgetCodeId;
    // }
    const budget = Budgets.findOne({_id: budgetCodeId})

    if(budget) {
      return budget.name
    }
  },
  'getAirlineName': function(airlineId) {
    const airline = Airlines.findOne({_id: airlineId})

    if(airline) {
      return airline.name
    }  else {
      if (airlineId === 'third_party_agent_flight') return 'A third party will cater for my flight'
      if (airlineId === 'company_will_process_flight') return 'Oilserv will cater for my flight'
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
});

/*****************************************************************************/
/* TravelRequisition2Print: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2Print.onCreated(function () {


  // console.log("Router current is:")
  // console.log(Router.current());
  //
  // console.log("Requisition ID is:")
  // console.log(Router.current().params.query.requisitionId);


  let self = this;
  // console.log("self is:")
  // console.log(self)

  let businessUnitId = Router.current().params._id;
  console.log("businessUnitId from print.js is:")
  console.log(businessUnitId)
  self.subscribe("allEmployees", Router.current().params._id);
  self.subscribe("hotels",  Router.current().params._id);
  self.subscribe("airlines",  Router.current().params._id);
  self.subscribe("budgets",  Router.current().params._id);
  self.subscribe("attachments", Router.current().params._id);

  let invokeReason = {}
  invokeReason.requisitionId = Router.current().params.query.requisitionId
  invokeReason.reason = 'edit'
  invokeReason.approverId = null


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
  //  self.businessUnitLogoUrl = new ReactiveVar()

  self.autorun(function() {
    // const travelcityz = Travelcities.findOne({"_id": "C1"})
    // console.log("travelcityz is:")
    // console.log(travelcityz);

    Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, customConfig) {
      if(!err) {
        self.businessUnitCustomConfig.set(customConfig)
      }
    })

    let travelcity =    self.subscribe("travelcities",businessUnitId)
    // console.log("travel businessUnitId 2 is")
    // console.log(businessUnitId)
    // console.log("travel travelcity 2 is")
    // console.log(travelcity)

    if(travelcity.ready()) {
      let travelcity2 = Travelcities.find({}).fetch();
      // console.log("travel city 2 is")
      // console.log(travelcity2)
    }
    else{
      // console.log("subscription did not work")
    }


    let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)

    // console.log("travelRequest2Sub is")
    // console.log(travelRequest2Sub)


    if(travelRequest2Sub.ready()) {
          let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId})
          Core.defaultDepartmentAndProject(self, travelRequestDetails)

      // console.log("travelRequestDetails is")
      // console.log(travelRequestDetails)
      self.currentTravelRequest.set(travelRequestDetails)
    }

    // if(businessUnitSubscription.ready()) {
    //     let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
    //     console.log("businessUnitId is")
    //     console.log(businessUnitId)
    //     console.log("businessUnit is")
    //     console.log(businessUnit)
    //     self.businessUnitLogoUrl.set(businessUnit.logoUrl)
    // }
  })


});

Template.TravelRequisition2Print.onRendered(function () {
  $('select.dropdown').dropdown();
  let self = this

  let currentTravelRequest = self.currentTravelRequest.get()
  console.log("currentTravelRequest")
  console.log(currentTravelRequest)
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

Template.TravelRequisition2Print.onDestroyed(function () {
});
