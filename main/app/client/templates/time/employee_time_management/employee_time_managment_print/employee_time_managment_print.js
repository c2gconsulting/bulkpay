
/*****************************************************************************/
/* TimeRecordPrint: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TimeRecordPrint: Helpers */
/*****************************************************************************/
Template.TimeRecordPrint.helpers({
  
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
    'getEmployeeFullName': function(employeeId) {
        let employee = Meteor.users.findOne({_id: employeeId});
        if(employee)
        return employee.profile.fullName;
        else
        return ""
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
    //     return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
    // },
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
            return Meteor.absoluteUrl() + 'business/' + currentTimeRecord.businessId + '/timerecord/printrequisition?requisitionId=' + currentTimeRecord._id
        }
    }
});

/*****************************************************************************/
/* TimeRecordPrint: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeRecordPrint.onCreated(function () {
    let self = this;
    console.log("self is:")
    console.log(self)
    let businessUnitId = Router.current().params._id;
    self.subscribe("allEmployees", Router.current().params._id);

    self.subscribe("travelcities", Router.current().params._id);
    self.subscribe("hotels", Router.current().params._id);
    self.subscribe("airlines", Router.current().params._id);
    self.subscribe("budgets", Router.current().params._id);


    let invokeReason = {}
    invokeReason.requisitionId = Router.current().params.query.requisitionId
    invokeReason.reason = 'edit'
    invokeReason.approverId = null


    self.currentTimeRecord = new ReactiveVar()
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

Template.TimeRecordPrint.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTimeRecord = self.currentTimeRecord.get()

    console.log("current time record is: ", self.currentTimeRecord)

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

Template.TimeRecordPrint.onDestroyed(function () {
});