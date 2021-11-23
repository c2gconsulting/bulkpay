
/*****************************************************************************/
/* TimeRecordDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TimeRecordDetail: Helpers */
/*****************************************************************************/
Template.TimeRecordDetail.helpers({
  timeRecordCheckedoffShoreWeek(val){
     const currentTimeRecord = Template.instance().currentTimeRecord.get();
     if(val == "monday"){
         return currentTimeRecord.offShoreWeek.monday === true ? checked="checked" : '';
     } else if(val == "tuesday"){
         return currentTimeRecord.offShoreWeek.tuesday === true ? checked="checked" : '';
     } else if(val == "wednesday"){
         return currentTimeRecord.offShoreWeek.wednesday === true ? checked="checked" : '';
     } else if(val == "thursday"){
         return currentTimeRecord.offShoreWeek.thursday === true ? checked="checked" : '';
     } else if(val == "friday"){
         return currentTimeRecord.offShoreWeek.friday === true ? checked="checked" : '';
     } else if(val == "saturday"){
         return currentTimeRecord.offShoreWeek.saturday === true ? checked="checked" : '';
     } else if(val == "sunday"){
         return currentTimeRecord.offShoreWeek.sunday === true ? checked="checked" : '';
     }
 },
 timeRecordCheckedonShoreWeek(val){
     const currentTimeRecord = Template.instance().currentTimeRecord.get();
     if(val == "monday"){
         return currentTimeRecord.onShoreWeek.monday === true ? checked="checked" : '';
     } else if(val == "tuesday"){
         return currentTimeRecord.onShoreWeek.tuesday === true ? checked="checked" : '';
     } else if(val == "wednesday"){
         return currentTimeRecord.onShoreWeek.wednesday === true ? checked="checked" : '';
     } else if(val == "thursday"){
         return currentTimeRecord.onShoreWeek.thursday === true ? checked="checked" : '';
     } else if(val == "friday"){
         return currentTimeRecord.onShoreWeek.friday === true ? checked="checked" : '';
     } else if(val == "saturday"){
         return currentTimeRecord.onShoreWeek.saturday === true ? checked="checked" : '';
     } else if(val == "sunday"){
         return currentTimeRecord.onShoreWeek.sunday === true ? checked="checked" : '';
     }
 },
 timeRecordCheckedVehicle(val){
     const currentTimeRecord = Template.instance().currentTimeRecord.get();
     if(val == "monday"){
         return currentTimeRecord.vehicle.monday === true ? checked="checked" : '';
     } else if(val == "tuesday"){
         return currentTimeRecord.vehicle.tuesday === true ? checked="checked" : '';
     } else if(val == "wednesday"){
         return currentTimeRecord.vehicle.wednesday === true ? checked="checked" : '';
     } else if(val == "thursday"){
         return currentTimeRecord.vehicle.thursday === true ? checked="checked" : '';
     } else if(val == "friday"){
         return currentTimeRecord.vehicle.friday === true ? checked="checked" : '';
     } else if(val == "saturday"){
         return currentTimeRecord.vehicle.saturday === true ? checked="checked" : '';
     } else if(val == "sunday"){
         return currentTimeRecord.vehicle.sunday === true ? checked="checked" : '';
     }
 },
  'errorMessage': function() {
      return Template.instance().errorMessage.get()
  },
  'checked': (prop) => {
      if(Template.instance().data)
        return Template.instance().data[prop];
      return false;
  },

  selected(context,val) {
      let self = this;

      if(Template.instance().data){
          //get value of the option element
          //check and return selected if the template instce of data.context == self._id matches
          if(val){
              return Template.instance().data[context] === val ? selected="selected" : '';
          }
          return Template.instance().data[context] === self._id ? selected="selected" : '';
      }
  },
  'getCurrentUserUnitName': function() {
      let unitId = Template.instance().unitId.get()
      if(unitId) {
          let unit = EntityObjects.findOne({_id: unitId});
          if(unit) {
            return unit.name
          }
        }
    },
    timeRecordCheckedoffShoreWeek(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(val == "monday"){
            return currentTimeRecord.offShoreWeek.monday === true ? checked="checked" : '';
        } else if(val == "tuesday"){
            return currentTimeRecord.offShoreWeek.tuesday === true ? checked="checked" : '';
        } else if(val == "wednesday"){
            return currentTimeRecord.offShoreWeek.wednesday === true ? checked="checked" : '';
        } else if(val == "thursday"){
            return currentTimeRecord.offShoreWeek.thursday === true ? checked="checked" : '';
        } else if(val == "friday"){
            return currentTimeRecord.offShoreWeek.friday === true ? checked="checked" : '';
        } else if(val == "saturday"){
            return currentTimeRecord.offShoreWeek.saturday === true ? checked="checked" : '';
        } else if(val == "sunday"){
            return currentTimeRecord.offShoreWeek.sunday === true ? checked="checked" : '';
        }
    },
    timeRecordCheckedonShoreWeek(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(val == "monday"){
            return currentTimeRecord.onShoreWeek.monday === true ? checked="checked" : '';
        } else if(val == "tuesday"){
            return currentTimeRecord.onShoreWeek.tuesday === true ? checked="checked" : '';
        } else if(val == "wednesday"){
            return currentTimeRecord.onShoreWeek.wednesday === true ? checked="checked" : '';
        } else if(val == "thursday"){
            return currentTimeRecord.onShoreWeek.thursday === true ? checked="checked" : '';
        } else if(val == "friday"){
            return currentTimeRecord.onShoreWeek.friday === true ? checked="checked" : '';
        } else if(val == "saturday"){
            return currentTimeRecord.onShoreWeek.saturday === true ? checked="checked" : '';
        } else if(val == "sunday"){
            return currentTimeRecord.onShoreWeek.sunday === true ? checked="checked" : '';
        }
    },
    timeRecordCheckedVehicle(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(val == "monday"){
            return currentTimeRecord.vehicle.monday === true ? checked="checked" : '';
        } else if(val == "tuesday"){
            return currentTimeRecord.vehicle.tuesday === true ? checked="checked" : '';
        } else if(val == "wednesday"){
            return currentTimeRecord.vehicle.wednesday === true ? checked="checked" : '';
        } else if(val == "thursday"){
            return currentTimeRecord.vehicle.thursday === true ? checked="checked" : '';
        } else if(val == "friday"){
            return currentTimeRecord.vehicle.friday === true ? checked="checked" : '';
        } else if(val == "saturday"){
            return currentTimeRecord.vehicle.saturday === true ? checked="checked" : '';
        } else if(val == "sunday"){
            return currentTimeRecord.vehicle.sunday === true ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTimeRecord.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();

        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();

        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].transportationMode === "AIR"? '':'none';
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
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index){
            return currentTimeRecord.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },
    isLastLeg(index){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && index && currentTimeRecord.type ==="Multiple"){
            return parseInt(index) >= currentTimeRecord.trips.length;
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
        return hotelId || 'I do not need a Hotel'
    },
    'getAirlineName': function(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})

        if(airline) {
            return airline.name
        } else {
            if (airlineId === 'third_party_agent_flight') return 'A third party will cater for my flight'
            if (airlineId === 'company_will_process_flight') return 'Oilserv will cater for my flight'
        }
    },
    'getBudgetName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    },
    cashAdvanceNotRequiredChecked(){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord){
            return currentTimeRecord.cashAdvanceNotRequired? checked="checked" : '';
        }
    },
    'currentTimeRecord': function() {
        return Template.instance().currentTimeRecord.get()
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
    'getPrintUrl': function(currentTimeRecord) {
        if(currentTimeRecord) {
            return Meteor.absoluteUrl() + 'business/' + currentTimeRecord.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTimeRecord._id
        }
    }
});

/*****************************************************************************/
/* TimeRecordDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeRecordDetail.onCreated(function () {
    let self = this;
    console.log("self is:")
    console.log(self)
    let businessUnitId = Session.get('context');
    self.subscribe("allEmployees", Session.get('context'));

    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));




    self.currentTimeRecord = new ReactiveVar()
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
        let timeRecordSub = self.subscribe('TimeRecord', invokeReason.requisitionId)


        if(timeRecordSub.ready()) {

            let timeRecordDetails = TimeRecord.findOne({_id: invokeReason.requisitionId})

            console.log("timeRecordDetails is:")
            console.log(timeRecordDetails)
            self.currentTimeRecord.set(timeRecordDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TimeRecordDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTimeRecord = self.currentTimeRecord.get()

    console.log("current time record is: ", self.currentTimeRecord)

    if(currentTimeRecord) {
        if(currentTimeRecord.status !== 'Draft' && currentTimeRecord.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentTimeRecord.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentTimeRecord.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TimeRecordDetail.onDestroyed(function () {
});