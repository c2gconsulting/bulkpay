/*****************************************************************************/
/* TimeRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeManagementCreate.events({

  'click #new-timeRecord-create': function(e, tmpl) {
      e.preventDefault()
      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      var numOfDaysOffShore = $(".offShore:checked").length;
      var numOfDaysOnShore = $(".onShore:checked").length;
      var numOfDaysWorked = numOfDaysOnShore + numOfDaysOffShore;
      currentTimeRecord.totalDaysWorkedOnshore = numOfDaysOnShore;
      currentTimeRecord.totalDaysWorkedOffshore = numOfDaysOffShore;
      currentTimeRecord.totalDaysWorked = numOfDaysWorked;

      tmpl.currentTimeRecord.set(currentTimeRecord);

      console.log("currentTimeRecord on create of time record is")
      console.log(currentTimeRecord)

          //explicitely set status
          currentTimeRecord.status = "Pending";

          Meteor.call('timeRecord/create', currentTimeRecord, (err, res) => {
              if (res){
                  swal({
                      title: "Time record created",
                      text: "Your Time record has been created, a notification has been sent to your supervisor",
                      confirmButtonClass: "btn-success",
                      type: "success",
                      confirmButtonText: "OK"
                  });
              } else {
                  swal({
                      title: "Oops!",
                      text: "Your Time record could not be created, reason: " + err.message,
                      confirmButtonClass: "btn-danger",
                      type: "error",
                      confirmButtonText: "OK"
                  });
                  console.log(err);
              }

          });
          Router.go('employee.time.index',{_id: Session.get('context')});





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
      currentTimeRecord.offShoreWeek.monday = $('[name="offShoreMonday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreTuesday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreTuesday = $('[name="offShoreTuesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.tuesday = $('[name="offShoreTuesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreWednesday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreWednesday = $('[name="offShoreWednesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.wednesday = $('[name="offShoreWednesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreThursday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreThursday = $('[name="offShoreThursday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.thursday = $('[name="offShoreThursday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreFriday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreFriday = $('[name="offShoreFriday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.friday = $('[name="offShoreFriday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreSaturday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreMonday = $('[name="offShoreSaturday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.saturday = $('[name="offShoreSaturday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=offShoreSunday]': function(e, tmpl) {
      e.preventDefault()
      let offShoreSunday = $('[name="offShoreSunday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.offShoreWeek.sunday = $('[name="offShoreSunday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);


  },

  'change [name=onShoreMonday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreMonday = $('[name="onShoreMonday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.monday = $('[name="onShoreMonday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreTuesday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreTuesday = $('[name="onShoreTuesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.tuesday = $('[name="onShoreTuesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreWednesday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreWednesday = $('[name="onShoreWednesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.wednesday = $('[name="onShoreWednesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreThursday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreThursday = $('[name="onShoreThursday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.thursday = $('[name="onShoreThursday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreFriday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreFriday = $('[name="onShoreFriday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.friday = $('[name="onShoreFriday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreSaturday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreMonday = $('[name="onShoreSaturday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.saturday = $('[name="onShoreSaturday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=onShoreSunday]': function(e, tmpl) {
      e.preventDefault()
      let onShoreSunday = $('[name="onShoreSunday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.onShoreWeek.sunday = $('[name="onShoreSunday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },

  'change [name=vehicleOnMonday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnMonday = $('[name="vehicleOnMonday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.monday = $('[name="vehicleOnMonday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnTuesday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnTuesday = $('[name="vehicleOnTuesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.tuesday = $('[name="vehicleOnTuesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnWednesday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnWednesday = $('[name="vehicleOnWednesday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.wednesday = $('[name="vehicleOnWednesday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnThursday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnThursday = $('[name="vehicleOnThursday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.thursday = $('[name="vehicleOnThursday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnFriday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnFriday = $('[name="vehicleOnFriday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.friday = $('[name="vehicleOnFriday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnSaturday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnMonday = $('[name="vehicleOnSaturday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.saturday = $('[name="vehicleOnSaturday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);
  },
  'change [name=vehicleOnSunday]': function(e, tmpl) {
      e.preventDefault()
      let vehicleOnSunday = $('[name="vehicleOnSunday"]').is(':checked') ? true : false;

      let currentTimeRecord = tmpl.currentTimeRecord.curValue;
      currentTimeRecord.vehicle.sunday = $('[name="vehicleOnSunday"]').is(':checked') ? true : false;
      tmpl.currentTimeRecord.set(currentTimeRecord);

  }
});



/*****************************************************************************/
/* TimeRequisitionCreate: Helpers */
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
/* TimeRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeManagementCreate.onCreated(function () {

    let self = this;

    let currentSupervisor = {}

      let user = Meteor.user()
      if(user.employeeProfile && user.employeeProfile.employment) {

    let userPosition =  EntityObjects.findOne({"_id": user.employeeProfile.employment.position})
    let supervisor =     Meteor.users.findOne({"employeeProfile.employment.position": userPosition.properties.supervisor})
    Session.set("supervisor",supervisor)
    }








    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    let businessUnitId = Session.get('context');
    let weekIndex = Session.get("weekIndex");
    let year = Session.get("year");
    let month = Session.get("month");



    let supervisor = Session.get('supervisor');


    let currentTimeRecord = {
        businessId: businessUnitId,
        createdBy: Meteor.user()._id,
        createdAt: new Date,

        projectCode: "",
        chargeCode: "",
        supervisorId: supervisor._id,
        totalDaysWorked : 0,
        totalDaysWorkedOnshore : 0,
        totalDaysWorkedOffshore : 0,
        status: "Pending",



        period: {
            year: year,
            month: month,
            weekIndex: weekIndex

          },
        onShoreWeek:
          {
            monday:false,
            tuesday:false,
            wednesday:false,
            thursday:false,
            friday:false,
            saturday:false,
            sunday:false,
            numOfDaysOnShore: 0

        },
        offShoreWeek:
          {
            monday:false,
            tuesday:false,
            wednesday:false,
            thursday:false,
            friday:false,
            saturday:false,
            sunday:false,
            numOfDaysOffShore: 0

        },
        vehicle:
          {
            monday:false,
            tuesday:false,
            wednesday:false,
            thursday:false,
            friday:false,
            saturday:false,
            sunday:false

        }

    };


    self.currentTimeRecord =  new ReactiveVar();
    self.currentTimeRecord.set(currentTimeRecord);



    // self.subscribe("flights", Session.get('context'));
    self.unitId = new ReactiveVar()
    self.units = new ReactiveVar([])
    self.businessUnitCustomConfig = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    //--
    self.selectedTimeType = new ReactiveVar()
    self.selectedCurrency = new ReactiveVar()
    self.selectedNumDays = new ReactiveVar()
    self.selectedCostCenter = new ReactiveVar()
    self.selectedstateId = new ReactiveVar()
    self.selectedTimecityId = new ReactiveVar()
    self.selectedflightrouteId = new ReactiveVar()


    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    let invokeReason = self.data;

    self.autorun(function(){

        // if (invokeReason){
        //     let TimeRequest2Sub = self.subscribe('TimeRecord', invokeReason.requisitionId);
        //     if(TimeRequest2Sub.ready()) {
        //         let TimeRequestDetails = TimeRequisition2s.findOne({_id: invokeReason.requisitionId});
        //         self.currentTimeRecord.set(TimeRequestDetails)
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
