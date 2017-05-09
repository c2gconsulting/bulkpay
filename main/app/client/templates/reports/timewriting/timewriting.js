
/*****************************************************************************/
/* TimeWritingReport: Event Handlers */
/*****************************************************************************/
Template.TimeWritingReport.events({
    'click .excel': (e, tmpl) => {
        event.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
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
            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), startTime, endTime, function(err, res) {
                resetButton()
                if(res){
                    BulkpayExplorer.exportAllData(res, `Comprehensive Report ${month}-${year}`);
                } else {
                    console.log(err);
                    swal('No result found', 'Payroll Result not found for period', 'error');
                }
            });
        } else {
            swal('Error', 'Please select Start and end Times', 'error');
        }
    }
});

/*****************************************************************************/
/* TimeWritingReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.TimeWritingReport.helpers({
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
/* TimeWritingReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeWritingReport.onCreated(function () {
    let self = this;
});

Template.TimeWritingReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();
});

Template.TimeWritingReport.onDestroyed(function () {
});
