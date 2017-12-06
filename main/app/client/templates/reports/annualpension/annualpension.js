
/*****************************************************************************/
/* AnnualPensionReport: Event Handlers */
/*****************************************************************************/
Template.AnnualPensionReport.events({
    'click .getResult': (e, tmpl) => {
        const year = $('[name="paymentPeriod.year"]').val();
        if(year) {
            Meteor.call('getAnnualPensionResult', Session.get('context'), year, function(err, res){
                if(res && res.length){
                    console.log('logging response as ', res);
                    tmpl.dict.set('result', res);
                } else {
                    swal('No result found', 'Payroll Result not found for year', 'error');
                }
            });
        } else {
            swal('Error', 'Please select a year', 'error');
        }
    },
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const year = $('[name="paymentPeriod.year"]').val();

        if(year) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);

            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }

            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('.excel').text(' Export to CSV');
                // Add back glyphicon
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };

            Meteor.call('exportAnnualPensionResult', Session.get('context'), year, function(err, res){
                if(res) {
                    BulkpayExplorer.exportAllData(res, "Pension Annual Report - " + year);
                    resetButton()
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select a year', 'error');
        }
    }
});

/*****************************************************************************/
/* AnnualPensionReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.AnnualPensionReport.helpers({
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
/* AnnualPensionReport: Lifecycle Hooks */
/*****************************************************************************/
Template.AnnualPensionReport.onCreated(function () {
    let self = this;
    self.dict = new ReactiveDict();

});

Template.AnnualPensionReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.AnnualPensionReport.onDestroyed(function () {
});
