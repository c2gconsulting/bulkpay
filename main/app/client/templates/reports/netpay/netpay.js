
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
  },
   'click .getResult': (e, tmpl) => {
      const month = $('[name="paymentPeriod.month"]').val();
      const year = $('[name="paymentPeriod.year"]').val();
      if(month && year) {
          const period = month + year;

          Meteor.call('getnetPayResult', Session.get('context'), period, function(err, res){
              console.log(res);
              if(res && res.length){
                  console.log('logging response as ', res);
                  tmpl.netPayReportResults.set(res);
              } else {
                  swal('No result found', 'Payroll Result not found for period', 'error');
                  tmpl.netPayReportResults.set(null);
              }
          });
      } else {
          swal('Error', 'Please select Period', 'error');
      }
   },
   'click .Export': (e, tmpl) => {
      let currentNetPayReportResults = tmpl.netPayReportResults.get();
      if(currentNetPayReportResults) {

        BulkpayExplorer.exportAllData(currentNetPayReportResults, `NetPay Report`);
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
    'result': () => {
        return Template.instance().netPayReportResults.get();
    }
});

/*****************************************************************************/
/* NetPayReport: Lifecycle Hooks */
/*****************************************************************************/
Template.NetPayReport.onCreated(function () {
    let self = this;
    self.netPayReportResults = new ReactiveVar();
});

Template.NetPayReport.onRendered(function () {
    //$('#example').DataTable();
  	self.$('select.dropdown').dropdown();
});

Template.NetPayReport.onDestroyed(function () {
});
