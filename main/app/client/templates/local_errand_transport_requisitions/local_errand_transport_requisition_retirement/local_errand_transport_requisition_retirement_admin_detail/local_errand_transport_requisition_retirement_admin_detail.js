
/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementAdminDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionRetirementAdminDetail.events({

    "change .selectFields": _.throttle(function(e, tmpl) {
        const fieldName = $(e.target).attr('name');
        let inputVal = $(e.target).val().trim();
        const customConfig = tmpl.localErrandTransportRequisitionCustomConfig.get();
        customConfig[fieldName] = inputVal
        tmpl.localErrandTransportRequisitionCustomConfig.set(customConfig)
    }),

    'click #requisition-edit': function(e, tmpl) {
        const isEdittableFields = Template.instance().isEdittableFields.get()
        if (isEdittableFields) {
            const customConfig = tmpl.localErrandTransportRequisitionCustomConfig.get();
            let currentLocalErrandTransportRequest = tmpl.currentLocalErrandTransportRequest.curValue;

            if (currentLocalErrandTransportRequest.retirementStatus === customConfig.retirementStatus) {
                // console.log()
                delete currentLocalErrandTransportRequest.retirementStatus
            }

            currentLocalErrandTransportRequest = {
                ...currentLocalErrandTransportRequest,
                ...customConfig,
            }

            Meteor.call('LocalErrandTransportRequest/editLocalErrandTransportRetirement', currentLocalErrandTransportRequest, (err, res) => {
                if (res){
                    swal({
                        title: "Local errand transport requisition created",
                        text: "Local errand transport request has been updated",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Local errand transport request could not be updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }

            });
            Template.instance().errorMessage.set(null);
            Modal.hide('LocalErrandTransportRequisitionRetirementAdminDetail');
        }
        Template.instance().isEdittableFields.set(!isEdittableFields)
    },
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

    'change input[type="file"]' ( event, template ) {
      Modules.client.uploadToAmazonS3( { event: event, template: template } );
    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementAdminDetail: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementAdminDetail.helpers({
    'isEdittableFields': function() {
        return Template.instance().isEdittableFields.get()
    },
    'getStatusColor': function() {
        return Template.instance().isEdittableFields.get() ? 'primary' : 'warning'
    },
    'getStatusText': function() {
        return Template.instance().isEdittableFields.get() ? 'Save' : 'Edit'
    },
    'employees': () => {
        return  Meteor.users.find({"employee": true});
    },
    'getBudgetCodeName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        } else {
            return 'Budget Code'
        }
    },
    allowedStatus() {
        return ["Not Retired","Draft","Retirement Submitted","Retirement Approved By Supervisor", "Retirement Rejected By Supervisor","Retirement Approved Finance","Retirement Rejected Finance"]
    },
    setDefaultStatus(val) {
        return val || 'Status'
    },
    setDefaultSupervisor(val) {
        return val ? (Meteor.users.findOne({_id: val})).profile.fullName : 'Supervisor'
    },
    setDefaultBudgetHolder(val) {
        return val ? (Meteor.users.findOne({_id: val})).profile.fullName : 'Budget Holder'
    },
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
    attachments: function () {
        // Meteor.Attachment.find({ })
        console.log('instance()', Template.instance())
        console.log('Template.instance()()', Template.instance().data)
        const requisitionId = Template.instance().currentLocalErrandTransportRequest.get()._id
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
            return Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/localerrandtransportrequests/printretirement?requisitionId=' + currentLocalErrandTransportRequest._id
        }
    }
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementAdminDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementAdminDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));
    self.subscribe("attachments", Session.get('context'));




    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);
    self.isEdittableFields = new ReactiveVar();
    self.isEdittableFields.set(false)
    self.localErrandTransportRequisitionCustomConfig = new ReactiveVar();
    self.localErrandTransportRequisitionCustomConfig.set({})
    self.currentLocalErrandTransportRequest = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()
    self.isInRetireMode = new ReactiveVar()
    self.attachments = new ReactiveVar()

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

Template.LocalErrandTransportRequisitionRetirementAdminDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentLocalErrandTransportRequest = self.currentLocalErrandTransportRequest.get()
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

Template.LocalErrandTransportRequisitionRetirementAdminDetail.onDestroyed(function () {
});
