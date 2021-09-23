
/*****************************************************************************/
/* TimeRecordSupervisorDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';





Template.TimeRecordSupervisorDetail.events({
    'click #approve': (e, tmpl) => {

        let currentTimeRecord = tmpl.currentTimeRecord.curValue;
        currentTimeRecord.status = "Approved by HOD";

        currentTimeRecord.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

        e.preventDefault()
            Meteor.call('timeRecord/supervisorApprovals', currentTimeRecord, (err, res) => {
                if (res){
                    swal({
                        title: "Time record has been updated",
                        text: "Employee travel record has been updated,notification has been sent to the necessary parties",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Travel record has  not been updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }
            });
            Template.instance().errorMessage.set(null);
            Modal.hide('TimeRecordSupervisorDetail');


    },



    'click #reject': (e, tmpl) => {

        let currentTimeRecord = tmpl.currentTimeRecord.curValue;
        currentTimeRecord.status = "Rejected By HOD";

        currentTimeRecord.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

        e.preventDefault()





            Meteor.call('timeRecord/supervisorApprovals', currentTimeRecord, (err, res) => {
                if (res){
                    swal({
                        title: "Time record has been rejected",
                        text: "Employee travel record has been rejected,notification has been sent to the necessary parties",
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Oops!",
                        text: "Time record has  not been updated, reason: " + err.message,
                        confirmButtonClass: "btn-danger",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                    console.log(err);
                }
            });
            Template.instance().errorMessage.set(null);
            Modal.hide('TimeRecordSupervisorDetail');

    },
    'change [id=budget-code]': function(e, tmpl) {
        e.preventDefault()

        console.log("budget codexxx");
        let currentTimeRecord = tmpl.currentTimeRecord.curValue;
        currentTimeRecord.budgetCodeId = $("#budget-code").val();
        tmpl.currentTimeRecord.set(currentTimeRecord);

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TimeRecordSupervisorDetail: Helpers */
/*****************************************************************************/
Template.TimeRecordSupervisorDetail.helpers({
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
  timeRecordChecked(val){
      const currentTimeRecord = Template.instance().currentTimeRecord.get();
      if(currentTimeRecord && val){
          return currentTimeRecord.week.monday === val ? checked="checked" : '';
      }
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
    travelTypeChecked(val){
        const currentTimeRecord = Template.instance().currentTimeRecord.get();
        if(currentTimeRecord && val){
            return currentTimeRecord.type === val ? checked="checked" : '';
        }
    },
    'currentTimeRecord': function() {
        return Template.instance().currentTimeRecord.get()
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
    'getPrintUrl': function(currentTimeRecord) {
        if(currentTimeRecord) {
            return Meteor.absoluteUrl() + 'business/' + currentTimeRecord.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTimeRecord._id
        }
    }
});

/*****************************************************************************/
/* TimeRecordSupervisorDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeRecordSupervisorDetail.onCreated(function () {


    let self = this;
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
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
        let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = TimeRecord.findOne({_id: invokeReason.requisitionId})
            self.currentTimeRecord.set(travelRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TimeRecordSupervisorDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTimeRecord = self.currentTimeRecord.get()
    if(currentTimeRecord) {
        if(currentTimeRecord.status !== 'Draft' && currentTimeRecord.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this time record. ", 'error')
            }
        } else if(currentTimeRecord.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentTimeRecord.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this time record. It has been approved", 'error')
            }
        }
    }
});

Template.TimeRecordSupervisorDetail.onDestroyed(function () {
});
