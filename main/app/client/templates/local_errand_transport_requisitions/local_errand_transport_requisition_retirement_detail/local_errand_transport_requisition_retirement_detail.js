
/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';
import axios from 'axios';
// import '/imports/api/methods.js'
// import { HTTP } from 'meteor/http'

import { Meteor } from 'meteor/meteor';

Template.LocalErrandTransportRequisitionRetirementDetail.events({
    'change ': function(e, tmpl) {
        e.preventDefault()
        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

        currentLocalErrandTransportRequest.actualTotalTripDuration = parseFloat(($("#actualTotalTripDuration").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalTripDuration = isNaN(currentLocalErrandTransportRequest.actualTotalTripDuration)?0:currentLocalErrandTransportRequest.actualTotalTripDuration;

        currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN = parseFloat(($("#actualTotalEmployeePerdiemNGN").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN = isNaN(currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN)?0:currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN;

        currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD = parseFloat(($("#actualTotalEmployeePerdiemUSD").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD = isNaN(currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD)?0:currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD;

        currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN = parseFloat(($("#actualTotalAirportTaxiCostNGN").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN = isNaN(currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN)?0:currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN;

        currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN = parseFloat(($("#actualTotalGroundTransportCostNGN").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN = isNaN(currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN)?0:currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN;

        currentLocalErrandTransportRequest.actualTotalMiscCostNGN = parseFloat(($("#actualTotalMiscCostNGN").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalMiscCostNGN = isNaN(currentLocalErrandTransportRequest.actualTotalMiscCostNGN)?0:currentLocalErrandTransportRequest.actualTotalMiscCostNGN;

        currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD = parseFloat(($("#actualTotalAirportTaxiCostUSD").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD = isNaN(currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD)?0:currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD;

        currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD = parseFloat(($("#actualTotalGroundTransportCostUSD").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD = isNaN(currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD)?0:currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD;

        currentLocalErrandTransportRequest.actualTotalMiscCostUSD = parseFloat(($("#actualTotalMiscCostUSD").val()).replace(',',''));
        currentLocalErrandTransportRequest.actualTotalMiscCostUSD = isNaN(currentLocalErrandTransportRequest.actualTotalMiscCostUSD)?0:currentLocalErrandTransportRequest.actualTotalMiscCostUSD;

        currentLocalErrandTransportRequest.actualTotalAncilliaryCostNGN = currentLocalErrandTransportRequest.actualTotalEmployeePerdiemNGN + currentLocalErrandTransportRequest.actualTotalAirportTaxiCostNGN + currentLocalErrandTransportRequest.actualTotalGroundTransportCostNGN + currentLocalErrandTransportRequest.actualTotalMiscCostNGN;
        currentLocalErrandTransportRequest.actualTotalAncilliaryCostUSD = currentLocalErrandTransportRequest.actualTotalEmployeePerdiemUSD + currentLocalErrandTransportRequest.actualTotalAirportTaxiCostUSD + currentLocalErrandTransportRequest.actualTotalGroundTransportCostUSD + currentLocalErrandTransportRequest.actualTotalMiscCostUSD;
        currentLocalErrandTransportRequest.additionalRetirementComment = $("#additionalRetirementComment").val();
        currentLocalErrandTransportRequest.tripReport = $("#tripReport").val();


        tmpl.currentLocalErrandTransportRequest.set(currentLocalErrandTransportRequest);
    },
    'click #new-retirement-create': function(e, tmpl) {
        e.preventDefault()
        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        currentLocalErrandTransportRequest.retirementStatus = "Retirement Submitted";
        Meteor.call('LocalErrandTransportRequest/retire', currentLocalErrandTransportRequest, (err, res) => {
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
    'click #new-retirement-save-draft': function(e, tmpl) {
        e.preventDefault()
        let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;
        currentLocalErrandTransportRequest.retirementStatus = "Draft";
        Meteor.call('LocalErrandTransportRequest/createDraft', currentLocalErrandTransportRequest, (err, res) => {
            if (res){
                swal({
                    title: "Trip Retirement Updated",
                    text: "Your trip requirement draft has been saved",
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal({
                    title: "Oops!",
                    text: "Your trip requirement could not be saved, reason: " + err.message,
                    confirmButtonClass: "btn-danger",
                    type: "error",
                    confirmButtonText: "OK"
                });
                console.log(err);
            }
        });

    },

    'dropped #dropzone': function (fileObj) {
        const formData = new FormData()
    },

    // 'click .remove-file': function(event, template) {
    //     var fileObj = this;
    //     if (!fileObj) {
    //         toastr.warning('No file selected', 'Warning');
    //         return false;
    //     }
    //     fileObj.remove();
    //     toastr.success('File deleted successfully', 'Success');
    //     return false;
    // },

    'change input[type="file"]' ( event, template ) {
      const formData = new FormData()

      if (!event.target || !event.target.files[0]) {
        return;
      }
      template.isUploading.set(true)
      Session.set('isUploading', true)

      formData.append(event.target.files[0].name, event.target.files[0])

      axios.post('https://9ic0ul4760.execute-api.eu-west-1.amazonaws.com/dev/upload', formData)
      .then(res => {
        const businessUnitId = Session.get('context');
        const currentLocalErrandTransportRequest = template.currentLocalErrandTransportRequest.curValue;
        const travelId = currentLocalErrandTransportRequest._id || currentLocalErrandTransportRequest.id;
    
        const newAttachment = {
            ...res.data,
            travelId,
            name: event.target.files[0].name,
            owner: Meteor.userId(),
            businessId: businessUnitId,
            tenantId: Core.getTenantId()
        }

        Meteor.call('attachment/create', newAttachment, (err, res) => {
            if (res){
                template.isUploading.set(false)
                Session.set('isUploading', false)
                toastr.success('File successfully uploaded', 'Success')
            } else {
                template.isUploading.set(false)
                Session.set('isUploading', false)
                toastr.error("Save Failed", "Couldn't Save new attachment", "error");
            }
        });
      })
      .catch(err => {
        template.isUploading.set(false)
        Session.set('isUploading', false)
      })
    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementDetail: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementDetail.helpers({
    // getAttachments: function () {
    //     const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
    //     const businessUnitId = Session.get('context');
    //     console.log('currentLocalErrandTransportRequest', currentLocalErrandTransportRequest)
    //     console.log('businessUnitId', businessUnitId)
    //     return Attachments.find({ businessId: businessUnitId })
    // },
     'isUnretiredTrips': function() {
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest) {
            return currentLocalErrandTransportRequest.retirementStatus === "Not Retired"

        }
     },
     'isRejectedTrips': function() {
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest) {
            return currentLocalErrandTransportRequest.retirementStatus === "Retirement Rejected By Supervisor"

        }
     },
     'isDraft': function() {
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest) {
            return currentLocalErrandTransportRequest.retirementStatus === "Draft"

        }
     },


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
    cashAdvanceNotRequiredChecked(){
        const currentLocalErrandTransportRequest = Template.instance().currentLocalErrandTransportRequest.get();
        if(currentLocalErrandTransportRequest){
            return currentLocalErrandTransportRequest.cashAdvanceNotRequired? checked="checked" : '';
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
    'getPrintUrl': function(currentLocalErrandTransportRequest) {
        if(currentLocalErrandTransportRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/travelrequests2/printretirement?requisitionId=' + currentLocalErrandTransportRequest._id
        }
    }
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));
    self.subscribe("attachments", Session.get('context'));




    self.currentLocalErrandTransportRequest = new ReactiveVar()
    self.isUploading = new ReactiveVar()
    self.isUploading.set(false)
    Session.set('isUploading', false)
    self.localErrandTransportRequestAttachment = new ReactiveVar()
    self.localErrandTransportRequestAttachment.set([])
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
        let attachmentSubscription = self.subscribe('Attachment', invokeReason.attachmentId)


        if(localErrandTransportRequestSub.ready()) {

            let localErrandTransportRequestDetails = LocalErrandTransportRequisitions.findOne({_id: invokeReason.requisitionId})
            self.currentLocalErrandTransportRequest.set(localErrandTransportRequestDetails)


        }

        if (attachmentSubscription.ready()) {
            let localErrandTransportRequestAttachment = Attachments.find({ travelId: invokeReason.requisitionId })
            console.log('localErrandTransportRequestAttachment', localErrandTransportRequestAttachment)
            self.localErrandTransportRequestAttachment.set(localErrandTransportRequestAttachment)
        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.LocalErrandTransportRequisitionRetirementDetail.onRendered(function () {
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

Template.LocalErrandTransportRequisitionRetirementDetail.onDestroyed(function () {
});
