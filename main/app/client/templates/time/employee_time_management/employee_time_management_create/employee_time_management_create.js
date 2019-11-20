/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeManagementCreate.events({

  'click #new-timeRecord-create': function(e, tmpl) {
      e.preventDefault()
      console.log("creating time record")




      let currentTimeRecord = tmpl.currentTimeRecord.curValue;

      //update projectCode one last final time
    //  tmpl.currentTimeRecord.set(currentTimeRecord);

      let fieldsAreValid = true;
      let validationErrors = '';

      /*** VALIDATIONS ***/
      //check that the projectCode is not hello

      if (currentTimeRecord.projectCode ===""){
          fieldsAreValid = false;
          validationErrors += ": projectCode cannot be empty";
      }

      if( currentTimeRecord.budgetCodeId=="I am not sure")
      {
          fieldsAreValid = false;
          validationErrors += ": select a budget code";
      }
      for (i = 0; i < currentTimeRecord.trips.length; i++) {
          const currentTrip = currentTimeRecord.trips[i];

          // if (currentTrip.transportationMode === ""){
          //     fieldsAreValid = false;
          //     validationErrors += ": select transportation mode";
          // }
          //console.log(currentTimeRecord.type);
          if ((currentTimeRecord.type === "Multiple") && ((i + 1) < currentTimeRecord.trips.length)) {
              const startDate = moment(currentTrip.departureDate);
              const endDate = moment(currentTimeRecord.trips[i+1].departureDate)

              if (endDate.diff(startDate, 'days') < 0){
                  fieldsAreValid = false;
                  validationErrors += ": Return date cannot be earlier than Departure date";
              }
          }else{
              const startDate = moment(currentTrip.departureDate);
              const endDate = moment(currentTrip.returnDate)

              if (endDate.diff(startDate, 'days') < 0){
                  fieldsAreValid = false;
                  validationErrors += ": Return date cannot be earlier than Departure date";
              }
          }

          if (currentTimeRecord.trips.length ===1){


              if (currentTrip.fromId === ""){
                  fieldsAreValid = false;
                  validationErrors += ": select your current location";
              }
              if (currentTrip.fromId.selectedIndex == 0){
                  fieldsAreValid = false;
                  validationErrors += ": select your current location";
              }
              if (currentTrip.toId === ""){
                  fieldsAreValid = false;
                  validationErrors += ": select your destination location";
              }
              if (currentTrip.hotelId === ""){
                  fieldsAreValid = false;
                  validationErrors += ": select a hotel";
              }
              //if (currentTrip.transportationMode === "AIRLINE" && currentTrip.airlineId === ""){
              //    fieldsAreValid = false;
              //    validationErrors += ": select an airline";
              //}
          }
      }


      if (fieldsAreValid){
          //explicitely set status
          currentTimeRecord.status = "Pending";

          Meteor.call('TravelRequest2/create', currentTimeRecord, (err, res) => {
              if (res){
                  swal({
                      title: "Travel requisition created",
                      text: "Your travel requisition has been created, a notification has been sent to your supervisor",
                      confirmButtonClass: "btn-success",
                      type: "success",
                      confirmButtonText: "OK"
                  });
              } else {
                  swal({
                      title: "Oops!",
                      text: "Your travel requisition could not be created, reason: " + err.message,
                      confirmButtonClass: "btn-danger",
                      type: "error",
                      confirmButtonText: "OK"
                  });
                  console.log(err);
              }

          });
          Template.instance().errorMessage.set(null);
          Modal.hide('EmployeeTimeManagementCreate');
      }else{
          Template.instance().errorMessage.set("Validation errors" + validationErrors);
      }

  },
  'change [name=projectCode]': function(e, tmpl) {
      e.preventDefault()
      let projectCode = $('#projectCode').val() || "";
      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.projectCode = $("#projectCode").val();
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=chargeCode]': function(e, tmpl) {
      e.preventDefault()
      let chargeCode = $('#chargeCode').val() || "";
      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
       currentTimeRecord.chargeCode = $("#chargeCode").val();
       tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreMonday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreMonday = $('[name="offShoreMonday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.monday = $('[name="offShoreMonday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreTuesday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreTuesday = $('[name="offShoreTuesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.tuesday = $('[name="offShoreTuesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreWednesday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreWednesday = $('[name="offShoreWednesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.wednesday = $('[name="offShoreWednesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreThursday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreThursday = $('[name="offShoreThursday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.thursday = $('[name="offShoreThursday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreFriday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreFriday = $('[name="offShoreFriday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.friday = $('[name="offShoreFriday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreSaturday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreMonday = $('[name="offShoreSaturday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.saturday = $('[name="offShoreSaturday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreSunday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreSunday = $('[name="offShoreSunday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.week.sunday = $('[name="offShoreSunday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);

      console.log("current time record for the week is:")
      console.log(currentTimeRecord)
  }


});



/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.EmployeeTimeManagementCreate.helpers({
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




});

/*****************************************************************************/
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeManagementCreate.onCreated(function () {

    let self = this;



    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    let weekIndex = Session.get("weekIndex");

    let currentTimeRecord = {
        businessId: businessUnitId,
        createdBy: Meteor.user()._id,
        createdAt: new Date,

        projectCode: "",
        chargeCode: "",
        supervisorId: "",
        budgetHolderId: "",
        totalDaysWorked : 0,

        period: {
            year: "",
            month: ""

          },
        week:
          {
            weekIndex: weekIndex,
            monday:false,
            tuesday:false,
            wednesday:false,
            thursday:false,
            friday:false,
            saturday:false,
            sunday:false,
            numOfDaysOffShore: 0,
            numOfDaysOnShore: 0,
            provideVehicleTransport: false
        }

    };

    console.log("current time record on create is:")
    console.log(currentTimeRecord)

    self.currentTimeRecord =  new ReactiveVar();
    self.currentTimeRecord.set(currentTimeRecord);



    // self.subscribe("flights", Session.get('context'));
    self.unitId = new ReactiveVar()
    self.units = new ReactiveVar([])
    self.businessUnitCustomConfig = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    //--
    self.selectedTravelType = new ReactiveVar()
    self.selectedCurrency = new ReactiveVar()
    self.selectedNumDays = new ReactiveVar()
    self.selectedCostCenter = new ReactiveVar()
    self.selectedstateId = new ReactiveVar()
    self.selectedtravelcityId = new ReactiveVar()
    self.selectedflightrouteId = new ReactiveVar()


    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    let invokeReason = self.data;

    self.autorun(function(){

        // if (invokeReason){
        //     let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId);
        //     if(travelRequest2Sub.ready()) {
        //         let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId});
        //         self.currentTimeRecord.set(travelRequestDetails)
        //
        //     }
        // }
    })


});

Template.EmployeeTimeManagementCreate.onRendered(function () {


    /*this.$('.datetimepicker').datetimepicker({
    format: 'YYYY-MM-DD',
    minDate: new Date()
})*/

});

Template.EmployeeTimeManagementCreate.onDestroyed(function () {
});
