
/*****************************************************************************/
/* TaxReport: Event Handlers */
/*****************************************************************************/
Template.TaxReport.events({
  'change [name=payrollReportPeriod]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
      Session.get('payrollPeriod', value);
      console.log("payrollPeriod changed to: " + value);
    }
  },
   'click .getResult': (e, tmpl) => {
      const month = $('[name="paymentPeriod.month"]').val();
      const year = $('[name="paymentPeriod.year"]').val();
      if(month && year) {
          const period = month + year;
          Meteor.call('getTaxResult', Session.get('context'), period, function(err, res){
              if(res && res.length){
                  console.log('logging response as ', res);
                  tmpl.dict.set('result', res);
              } else {
                  swal('No result found', 'Payroll Result not found for period', 'error');
              }
          });
      } else {
          swal('Error', 'Please select Period', 'error');
      }

   }
});

/*****************************************************************************/
/* TaxReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.TaxReport.helpers({
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
    'result': () => {
        return Template.instance().dict.get('result');
    }
});

/*****************************************************************************/
/* TaxReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TaxReport.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

});

Template.TaxReport.onRendered(function () {
  //$('#example').DataTable();
});

Template.TaxReport.onDestroyed(function () {
});
