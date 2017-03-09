
/*****************************************************************************/
/* NetPayReport: Event Handlers */
/*****************************************************************************/
Template.NetPayReport.events({
  'change [name=payrollReportPeriod]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
      Session.get('payrollPeriod', value);
      console.log("payrollPeriod changed to: " + value);
    }
  }
});

/*****************************************************************************/
/* NetPayReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.NetPayReport.helpers({
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
        return [{
          fullName : "Adetunji Akinde",
          bank : "First bank",
          accountNumber : "9090323232",
          netPay : 90000
        }]
    }
});

/*****************************************************************************/
/* NetPayReport: Lifecycle Hooks */
/*****************************************************************************/
Template.NetPayReport.onCreated(function () {

});

Template.NetPayReport.onRendered(function () {
  //$('#example').DataTable();
});

Template.NetPayReport.onDestroyed(function () {
});
