
/*****************************************************************************/
/* LocalErrandTransportRequisitionPrint: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';


Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionPrint: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionPrint.helpers({
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
  'getHotelName': function(hotelId) {
    // const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
    // if(currentLocalErrandTransportRequest && hotelId){
    //   let index = currentLocalErrandTransportRequest.trips.tripIndex
    //     return currentLocalErrandTransportRequest.trips.hotelId;
    // }
    const hotel = Hotels.findOne({_id: hotelId})

    if(hotel) {
      return hotel.name
    }
  },

  'getBudgetName': function(budgetCodeId) {
    // const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
    // if(currentLocalErrandTransportRequest && budgetCodeId){
    //     return currentLocalErrandTransportRequest.budgetCodeId;
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
    }
  },
  cashAdvanceNotRequiredChecked(){
    const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
    if(currentLocalErrandTransportRequest){
      return currentLocalErrandTransportRequest.cashAdvanceNotRequired? checked="checked" : '';
    }
  },


  'currentLocalErrandTransportRequest': function() {
    return Template.instance().currentLocalErrandTransportRequest.get()
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
/* LocalErrandTransportRequisitionPrint: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionPrint.onCreated(function () {


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

  let invokeReason = {}
  invokeReason.requisitionId = Router.current().params.query.requisitionId
  invokeReason.reason = 'edit'
  invokeReason.approverId = null


  self.currentLocalErrandTransportRequest = new ReactiveVar()
  self.isInEditMode = new ReactiveVar()
  self.isInViewMode = new ReactiveVar()
  self.isInApproveMode = new ReactiveVar()
  self.isInApproverEditMode = new ReactiveVar()
  self.isInTreatMode = new ReactiveVar()
  self.isInRetireMode = new ReactiveVar()

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


    let localErrandTransportRequestSub = self.subscribe('LocalErrandTransportRequest', invokeReason.requisitionId)

    // console.log("localErrandTransportRequestSub is")
    // console.log(localErrandTransportRequestSub)


    if(localErrandTransportRequestSub.ready()) {
          let localErrandTransportRequestDetails = LocalErrandTransportRequisitions.findOne({_id: invokeReason.requisitionId})
      // console.log("localErrandTransportRequestDetails is")
      // console.log(localErrandTransportRequestDetails)
      self.currentLocalErrandTransportRequest.set(localErrandTransportRequestDetails)
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

Template.LocalErrandTransportRequisitionPrint.onRendered(function () {
  $('select.dropdown').dropdown();
  let self = this

  let currentLocalErrandTransportRequest = self.currentLocalErrandTransportRequest.get()
  console.log("currentLocalErrandTransportRequest")
  console.log(currentLocalErrandTransportRequest)
  if(currentLocalErrandTransportRequest) {
    if(currentLocalErrandTransportRequest.status !== 'Draft' && currentLocalErrandTransportRequest.status !== 'Pending') {
      if(self.isInEditMode.get()) {
        Modal.hide();
        swal('Error', "Sorry, you can't edit this local errand transport request. ", 'error')
      }
    } else if(currentLocalErrandTransportRequest.status === 'Pending') {
      self.isInViewMode.set(true)
    } else if(currentLocalErrandTransportRequest.status === 'Approve') {
      if(self.isInEditMode.get()) {
        swal('Error', "Sorry, you can't edit this local errand transport request. It has been approved", 'error')
      }
    }
  }
});

Template.LocalErrandTransportRequisitionPrint.onDestroyed(function () {
});
