
/*****************************************************************************/
/* ComprehensizeReport: Event Handlers */
/*****************************************************************************/
Template.ComprehensiveReport.events({
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const month = $('[name="paymentPeriod.month"]').val();
        const year = $('[name="paymentPeriod.year"]').val();
        if(month && year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };
            //--
            const period = month + year;
            Meteor.call('reports/getComprehensivePayResult', Session.get('context'), period, function(err, res){
                if(res){
                    BulkpayExplorer.exportAllData(res, `Comprehensive Report ${month}-${year}`);
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Period', 'error');
        }
    }
});

/*****************************************************************************/
/* ComprehensiveReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.ComprehensiveReport.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    },
    'month': function(){
        return Core.months()
    },
    'year': function(){
        return Core.years();
    }
});

/*****************************************************************************/
/* ComprehensiveReport: Lifecycle Hooks */
/*****************************************************************************/
Template.ComprehensiveReport.onCreated(function () {
    let self = this;
});

Template.ComprehensiveReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();
});

Template.ComprehensiveReport.onDestroyed(function () {
});
