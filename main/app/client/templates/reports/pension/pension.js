
/*****************************************************************************/
/* PensionReport: Event Handlers */
/*****************************************************************************/
Template.PensionReport.events({
    'click .getResult': (e, tmpl) => {
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(month && year) {
            const period = month + year;
            Meteor.call('getPensionResult', Session.get('context'), period, function(err, res){
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
    'result': () => {
        return Template.instance().dict.get('result');
    }
});

/*****************************************************************************/
/* PensionReport: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionReport.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

});

Template.PensionReport.onRendered(function () {
  //$('#example').DataTable();
});

Template.PensionReport.onDestroyed(function () {
});
