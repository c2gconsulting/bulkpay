
import _ from 'underscore';

/*****************************************************************************/
/* TaxReport: Event Handlers */
/*****************************************************************************/
Template.TaxReport.events({
  'change [name=payrollReportPeriod]': function (e, tmpl) {
    let value = e.currentTarget.value;

    if (value && value.trim().length > 0) {
      Session.get('payrollPeriod', value);
    }
  },
   'click .getResult': (e, tmpl) => {
      const month = $('[name="paymentPeriod.month"]').val();
      const year = $('[name="paymentPeriod.year"]').val();
      if(month && year) {
          const period = month + year;
          Meteor.call('getTaxResult', Session.get('context'), period, function(err, res){
              if(res && res.length) {
                  let taxCodes = tmpl.getTaxHeaders(res)
                  tmpl.taxCodes.set(taxCodes);

                  tmpl.taxReportData.set(res);
              } else {
                  swal('No result found', 'Payroll Result not found for period', 'error');
              }
          });
      } else {
          swal('Error', 'Please select Period', 'error');
      }

   },
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


            let resetButton = function() {
                // End button animation
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

            const period = month + year;
            Meteor.call('exportTaxResult', Session.get('context'), period, function(err, res){
                if(res){
                    //call the export fo
                    BulkpayExplorer.exportAllData(res, "taxReport");
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
    'year': function() {
        return Core.years();
    },
    'result': () => {
        return Template.instance().taxReportData.get();
    },
    'taxHeaders': () => {
        return Template.instance().taxCodes.get();
    },
    'getTaxAmount': (taxRecord, taxCode) => {
        let taxCodes = Template.instance().taxCodes.get();
        if(taxCodes) {
            if(taxRecord.code === taxCode) {
                return taxRecord.amount
            } else {
                return ''
            }
        } else {
            return ''
        }
    }
});

/*****************************************************************************/
/* TaxReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TaxReport.onCreated(function () {
    let self = this;

    self.taxReportData = new ReactiveVar();
    self.taxCodes = new ReactiveVar();

    self.getTaxHeaders = (fullReportData) => {
        if(fullReportData && fullReportData.length > 0) {
            let headersList = []
            fullReportData.forEach(aTaxRecord => {
                let foundTaxCodeInHeadersList = _.find(headersList, aHeader => {
                    return aHeader === aTaxRecord.code
                })
                if(!foundTaxCodeInHeadersList) {
                    headersList.push(aTaxRecord.code)
                }
            })
            return headersList
        }
    }
});

Template.TaxReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TaxReport.onDestroyed(function () {
});
