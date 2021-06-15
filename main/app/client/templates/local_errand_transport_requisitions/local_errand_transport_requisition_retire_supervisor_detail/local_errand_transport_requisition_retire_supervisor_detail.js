
/*****************************************************************************/
/* LocalErrandTransportRequisitionSupervisorRetirementDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionSupervisorRetirementDetail.events({
    'click #approve': (e, tmpl) => {

      let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
      currentLocalErrandTransportRequest.supervisorRetirementComment = $("#supervisorRetirementComment").val();
      currentLocalErrandTransportRequest.retirementStatus = "Retirement Approved By Supervisor";


     Meteor.call('LocalErrandTransportRequest/supervisorRetirements', currentLocalErrandTransportRequest, (err, res) => {
         if (res){
             swal({
                 title: "Trip retirement has been approved by supervisor",
                 text: "Employee retirement has been updated,notification has been sent to the necessary parties",
                 confirmButtonClass: "btn-success",
                 type: "success",
                 confirmButtonText: "OK"
             });
         } else {
             swal({
                 title: "Oops!",
                 text: "Employee retirement has not been updated, reason: " + err.message,
                 confirmButtonClass: "btn-danger",
                 type: "error",
                 confirmButtonText: "OK"
             });
             console.log(err);
         }
     });
    },
     'click #reject': (e, tmpl) => {

         let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
         currentLocalErrandTransportRequest.supervisorRetirementComment = $("#supervisorRetirementComment").val();
         currentLocalErrandTransportRequest.retirementStatus = "Retirement Rejected By Supervisor";

      Meteor.call('LocalErrandTransportRequest/supervisorRetirements', currentLocalErrandTransportRequest, (err, res) => {
          if (res){
              swal({
                  title: "Trip retirement has been rejected by supervisor",
                  text: "Employee retirement has been updated,notification has been sent to the necessary parties",
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
          } else {
              swal({
                  title: "Oops!",
                  text: "Employee retirement has not been updated, reason: " + err.message,
                  confirmButtonClass: "btn-danger",
                  type: "error",
                  confirmButtonText: "OK"
              });
              console.log(err);
          }
      });
    }

});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionSupervisorRetirementDetail: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionSupervisorRetirementDetail.helpers({
    checkWhoToRefund(currency){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        let formatNumber = function(numberVariable, n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return numberVariable.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        }

        if (currency === "USD"){
            let usdDifference = currentLocalErrandTransportRequest.totalAncilliaryCostUSD - currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD;
            if (currentLocalErrandTransportRequest.cashAdvanceNotRequired){
                usdDifference = -1 * currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD;
            }
            if (usdDifference > 0){
                return "Employee to refund " + formatNumber(usdDifference,2) + " USD";
            }else if (usdDifference < 0){
                return "Company to refund " + formatNumber((-1 * usdDifference),2) + " USD";
            }else{
                return "No USD refunds"
            }
        }else if (currency === "NGN"){
            let ngnDifference = currentLocalErrandTransportRequest.totalAncilliaryCostNGN - currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN;
            if (currentLocalErrandTransportRequest.cashAdvanceNotRequired){
                ngnDifference = -1 * currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN;
            }
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
    'getEmployeeNameById': function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
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
    cashAdvanceNotRequiredChecked(){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest){
            return currentLocalErrandTransportRequest.cashAdvanceNotRequired? checked="checked" : '';
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
/* LocalErrandTransportRequisitionSupervisorRetirementDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionSupervisorRetirementDetail.onCreated(function () {
    let self = this;
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
        let localErrandTransportRequestSub = self.subscribe('LocalErrandTransportRequest', invokeReason.requisitionId)


        if(localErrandTransportRequestSub.ready()) {

            let localErrandTransportRequestDetails = LocalErrandTransportRequisitions.findOne({_id: invokeReason.requisitionId})
            self.currentLocalErrandTransportRequest.set(localErrandTransportRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.LocalErrandTransportRequisitionSupervisorRetirementDetail.onRendered(function () {
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

Template.LocalErrandTransportRequisitionSupervisorRetirementDetail.onDestroyed(function () {
});
