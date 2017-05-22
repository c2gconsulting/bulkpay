
/*****************************************************************************/
/* TimeWritingReport: Event Handlers */
/*****************************************************************************/
Template.TimeWritingReport.events({
    'click #getReportForProjectsForDisplay': function(e, tmpl) {
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

                tmpl.$('#getReportForPeriodForDisplay').text('Get reports for projects');
                // $('#getReportForPeriodForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForPeriodForDisplay').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.showingReportsForProjects.set(true)
                    tmpl.timeWritingReports.set(res)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });
        }
    },
    'click #exportReportForProjects': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#exportReportForProjects').text('Preparing... ');
            tmpl.$('#exportReportForProjects').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#exportReportForProjects')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#exportReportForProjects')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#exportReportForProjects').text('Export');
                $('#exportReportForProjects').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#exportReportForProjects').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.showingReportsForProjects.set(true)
                    tmpl.timeWritingReports.set(res)
                    tmpl.exportTimesForProjectsReportData(res, startTime, endTime)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });            
        }
    },
    'click #getReportForUnitsForDisplay': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#getReportForUnitsForDisplay').text('Preparing... ');
            tmpl.$('#getReportForUnitsForDisplay').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#getReportForUnitsForDisplay')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#getReportForUnitsForDisplay')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#getReportForUnitsForDisplay').text('Get reports for units');
                // $('#getReportForUnitsForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForUnitsForDisplay').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/timesForEveryoneByUnit', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.showingReportsForUnits.set(true)
                    tmpl.timeWritingReports.set(res)
                } else {
                    swal('No result found', err.reason, 'error');
                }
            });            
        }
    },
    'click #exportReportForUnits': function(e, tmpl) {
        e.preventDefault();
        const startTime = $('[name="startTime"]').val();
        const endTime = $('[name="endTime"]').val();

        if(startTime && endTime) {
            tmpl.$('#exportReportForUnits').text('Preparing... ');
            tmpl.$('#exportReportForUnits').attr('disabled', true);
            try {
                let l = Ladda.create(tmpl.$('#exportReportForUnits')[0]);
                l.start();
            } catch(e) {
            }
            //--
            let resetButton = function() {
                try {
                    let l = Ladda.create(tmpl.$('#exportReportForUnits')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                }

                tmpl.$('#exportReportForUnits').text('Export');
                $('#exportReportForUnits').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#exportReportForUnits').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            Meteor.call('reports/timesForEveryoneByUnit', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, function(err, res) {
                resetButton()
                if(res){
                    tmpl.showingReportsForUnits.set(true)
                    tmpl.timeWritingReports.set(res)
                    tmpl.exportTimesForUnitsReportData(res, startTime, endTime)
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
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    'showingReportsForProjects': function() {
        return Template.instance().showingReportsForProjects.get()
    },
    'showingReportsForUnits': function() {
        return Template.instance().showingReportsForUnits.get()
    }
});

/*****************************************************************************/
/* TimeWritingReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeWritingReport.onCreated(function () {
    let self = this;

    self.timeWritingReports = new ReactiveVar()
    self.showingReportsForProjects = new ReactiveVar()
    self.showingReportsForUnits = new ReactiveVar()

    self.getDateFromString = function(str1) {
        let theDate = moment(str1);
        return theDate.add('hours', 1).toDate()
    }

    self.exportTimesForProjectsReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Project > Employee", "Hours"]

        let reportData = []

        theData.forEach(aDatum => {
            let projectName = aDatum.projectName
            reportData.push(["Project: " + projectName, ""])
            //--
            let projectEmployees = aDatum.employees
            projectEmployees.forEach(anEmployeeDatum => {
                let empDetails = anEmployeeDatum.employeeDetails
                let empCodeAndName = "Employee ID: " + empDetails.employmentCode + " - " + empDetails.fullName
                reportData.push([empCodeAndName, ""])

                anEmployeeDatum.days.forEach(anEmployeeDayDatum => {
                    reportData.push([anEmployeeDayDatum.day, anEmployeeDayDatum.duration])
                })

                reportData.push(["EmployeeTotal:", anEmployeeDatum.employeeTimeTotal])
            })
            //--
            reportData.push(["Project Total Hours: ", aDatum.projectTotalHours])
        })
        BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
            `Project Time Report ${startTime} - ${endTime}`);
    }

    self.exportTimesForUnitsReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Unit > Employee", "Hours"]

        let reportData = []

        theData.forEach(aDatum => {
            let unitName = aDatum.unitName
            reportData.push(["Unit: " + unitName, ""])
            //--
            let unitEmployees = aDatum.employees
            unitEmployees.forEach(anEmployeeDatum => {
                let empDetails = anEmployeeDatum.employeeDetails
                let empCodeAndName = empDetails.employmentCode + " - " + empDetails.fullName
                reportData.push([empCodeAndName, anEmployeeDatum.employeeTimeTotal])
            })
            //--
            reportData.push(["Unit Total Hours: ", aDatum.unitTotalHours])
        })
        BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData}, 
            `Cost-Center Time Report ${startTime} - ${endTime}`);
    }
});

Template.TimeWritingReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();
});

Template.TimeWritingReport.onDestroyed(function () {
});
