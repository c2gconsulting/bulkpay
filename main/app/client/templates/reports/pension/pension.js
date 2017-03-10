
/*****************************************************************************/
/* PensionReport: Event Handlers */
/*****************************************************************************/
Template.PensionReport.events({
  'change [name=payrollReportPeriod]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
      Session.get('payrollPeriod', value);
      console.log("payrollPeriod changed to: " + value);
    }
  }
});

/*****************************************************************************/
/* PensionReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.PensionReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    },
    'payrollPeriod': function() {
      return Session.get('payrollPeriod');
    },
    'payrollResults': function() {
      return Meteor.users.find({
        "employee": true,
        "employeeProfile.employment.status": "Active"
      });
    }
});

/*****************************************************************************/
/* PensionReport: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionReport.onCreated(function () {

});

Template.PensionReport.onRendered(function () {
  //$('#example').DataTable();
});

Template.PensionReport.onDestroyed(function () {
});
