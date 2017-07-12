
/*****************************************************************************/
/* TravelRequestReport: Event Handlers */
/*****************************************************************************/
Template.TravelRequestReport.events({
    'click #getResult': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#getResult').text('Preparing... ');
            tmpl.$('#getResult').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#getReportForPeriodForDisplay')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#getResult')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#getResult').text(' View');
                tmpl.$('#getResult').removeAttr('disabled');
            };
            //--
            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/travelRequest', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
                resetButton()
                if(res){
                    tmpl.travelRequestReports.set(res)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });
        }
    },
    'click #excel': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#excel').text('Preparing... ');
            tmpl.$('#excel').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#excel')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#excel')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#excel').text('Export');
                $('#excel').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#excel').removeAttr('disabled');
            };
            //--
            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/travelRequest', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
                resetButton()
                if(res){
                    tmpl.travelRequestReports.set(res)
                    tmpl.exportProcurementReportData(res, startTime, endTime)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });            
        }
    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.selectedEmployees.set(selected)
    }
});

/*****************************************************************************/
/* TravelRequestReport: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MMYYYY');
});

Template.TravelRequestReport.helpers({
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
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    'travelRequestReports': function() {
        return Template.instance().travelRequestReports.get()
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    'tripTotalCost': function(travelRequestDetails) {
        return Template.instance().getTotalTripCost(travelRequestDetails)
    }
});

/*****************************************************************************/
/* TravelRequestReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequestReport.onCreated(function () {
    let self = this;

    self.travelRequestReports = new ReactiveVar()

    self.selectedEmployees = new ReactiveVar()

    self.getDateFromString = function(str1) {
        let theDate = moment(str1);
        return theDate.add('hours', 1).toDate()
    }

    self.exportProcurementReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Created By", "Unit", "Date required", "Trip Cost", "Status"]

        let reportData = []

        theData.forEach(aDatum => {
            reportData.push([aDatum.createdByFullName, aDatum.unitName, aDatum.createdAt, 
            self.getTotalTripCost(aDatum), aDatum.status])
        })
        BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
            `Travel Requisition Report ${startTime} - ${endTime}`);
    }

    self.getTotalTripCost = function(travelRequestDetails) {
        if(travelRequestDetails && travelRequestDetails.tripCosts) {
            let flightCost = travelRequestDetails.tripCosts.flightCost || 0
            let accommodationCost = travelRequestDetails.tripCosts.accommodationCost || 0
            let localTransportCost = travelRequestDetails.tripCosts.localTransportCost || 0
            let perDiemCost = travelRequestDetails.tripCosts.perDiemCost || 0
            let miscCosts = travelRequestDetails.tripCosts.miscCosts || 0

            let totalTripCost = flightCost + accommodationCost + localTransportCost + 
                perDiemCost + miscCosts

            return totalTripCost
        }
    }
});

Template.TravelRequestReport.onRendered(function () {
    self.$('select.dropdown').dropdown();
});

Template.TravelRequestReport.onDestroyed(function () {
});
