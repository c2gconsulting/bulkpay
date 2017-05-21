
/*****************************************************************************/
/* TimeWritingReport: Event Handlers */
/*****************************************************************************/
Template.TimeWritingReport.events({
    'click .excel': (e, tmpl) => {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('.excel').text('Preparing... ');
            tmpl.$('.excel').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('.excel')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('.excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('.excel').text(' Export to CSV');
                $('.excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('.excel').removeAttr('disabled');
            };
            //--
            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            //--
            // Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
            //     startTimeAsDate, endTimeAsDate, function(err, res) {
            //     resetButton()
            //     if(res){
            //         // BulkpayExplorer.exportAllData(res, `Comprehensive Report ${month}-${year}`);
            //     } else {
            //         console.log(err);
            //         swal('No result found', 'Result not found for period', 'error');
            //     }
            // });
        } else {
            swal('Error', 'Please select Start and end Times', 'error');
        }
    },
    'click #getReportForPeriodForDisplay': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#getReportForPeriodForDisplay').text('Preparing... ');
            tmpl.$('#getReportForPeriodForDisplay').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#getReportForPeriodForDisplay').text('Get reports');
                $('#getReportForPeriodForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForPeriodForDisplay').removeAttr('disabled');
            };
            //--

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.timeWritingReports.set(res)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });            
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
    },
    'timeWritingReports': function() {
        return Template.instance().timeWritingReports.get()
    }
});

/*****************************************************************************/
/* TimeWritingReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeWritingReport.onCreated(function () {
    let self = this;

    self.timeWritingReports = new ReactiveVar()

    self.getDateFromString = function(str1) {
        let theDate = moment(str1);
        return theDate.add('hours', 1).toDate()
    }
});

Template.TimeWritingReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();
});

Template.TimeWritingReport.onDestroyed(function () {
});
