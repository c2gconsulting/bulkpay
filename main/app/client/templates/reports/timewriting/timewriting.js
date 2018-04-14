
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

                tmpl.$('#getReportForPeriodForDisplay').text('Project reports');
                // $('#getReportForPeriodForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForPeriodForDisplay').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
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
    'click #timesForEveryoneByProject_Tabular': function(e, tmpl) {
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

                tmpl.$('#getReportForPeriodForDisplay').text('Project reports');
                // $('#getReportForPeriodForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForPeriodForDisplay').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForProjects_Tabular.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByProject_Tabular', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
                resetButton()
                if(res) {
                    console.log('res: ', res)

                    tmpl.showingReportsForProjects.set(false)
                    tmpl.showingReportsForProjects_Tabular.set(true)
                    tmpl.timeWritingReports_Tabular.set(res)
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

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByProject', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
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
    'click #exportReportForProjects_Tabular': function(e, tmpl) {
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
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForProjects_Tabular.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByProject_Tabular', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
                resetButton()
                if(res){
                    tmpl.showingReportsForProjects.set(false)
                    tmpl.showingReportsForProjects_Tabular.set(true)
                    tmpl.timeWritingReports_Tabular.set(res)
                    tmpl.exportTimesForProjects_Tabular_ReportData(res, startTime, endTime)
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

                tmpl.$('#getReportForUnitsForDisplay').text('Cost-Center reports');
                // $('#getReportForUnitsForDisplay').prepend("<i class='glyphicon glyphicon-download'></i>");
                tmpl.$('#getReportForUnitsForDisplay').removeAttr('disabled');
            };
            //--
            Template.instance().showingReportsForProjects.set(false)
            Template.instance().showingReportsForUnits.set(false)

            let startTimeAsDate = tmpl.getDateFromString(startTime)
            let endTimeAsDate = tmpl.getDateFromString(endTime)

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByUnit', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
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

            let selectedEmployees = tmpl.selectedEmployees.get()

            Meteor.call('reports/timesForEveryoneByUnit', Session.get('context'), 
                startTimeAsDate, endTimeAsDate, selectedEmployees, function(err, res) {
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
    },
    'change [name="employee"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.selectedEmployees.set(selected)
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
    'employees': () => {
        return Meteor.users.find({"employee": true});
    },
    'timeWritingReports': function() {
        return Template.instance().timeWritingReports.get()
    },
    'timeWritingReports_Tabular': function() {
        return Template.instance().timeWritingReports_Tabular.get()
    },
    'getEmployeeProjectCodeDuration': (employeeData, projectCode) => {
        const projectDuration = _.find(employeeData.projects, project => {
            if(project.project) {
                return project.project === projectCode
            } else {
                return '---' === projectCode                
            }
        })
        if(projectDuration) {
            if(employeeData.totalDuration > 0) {
                let ratio = (projectDuration.duration / employeeData.totalDuration) * 100
                return `${ratio.toFixed(2)}%`
            } else {
                return '---'
            }
        } else {
            return '---'
        }
    },
    'getEmployeeProjectCodeTotalDuration': (projectCode) => {
        const timeWritingReports_Tabular = Template.instance().timeWritingReports_Tabular.get()
        if(timeWritingReports_Tabular) {
            let result = 0;

            const employeeData = timeWritingReports_Tabular.employeeData;
            employeeData.forEach(data => {
                const projectDuration = _.find(data.projects, project => {
                    if(project.project) {
                        return project.project === projectCode
                    } else {
                        return '---' === projectCode                
                    }
                })
                if(projectDuration) {
                    if(data.totalDuration > 0) {
                        let ratio = (projectDuration.duration / data.totalDuration) * 100
                        result += ratio
                    } else {
                        return '---'
                    }
                }
            })

            return `${result.toFixed(2)}%`
        }
        return '---'
    },
    'getTotalDurationForEverybody': () => {
        const timeWritingReports_Tabular = Template.instance().timeWritingReports_Tabular.get()
        if(timeWritingReports_Tabular) {
            let totalDuration = 0;

            const projectCodes = Object.keys(timeWritingReports_Tabular.projectCodeTotals) || [];
            projectCodes.forEach(projectCode => {
                const projectCodeTotalData = timeWritingReports_Tabular.projectCodeTotals[projectCode]

                if(projectCodeTotalData) {
                    totalDuration += projectCodeTotalData.total;
                }
            })

            return totalDuration;
        }
    },
    'getTotalNumberOfEmployeesPercentage': () => {
        const timeWritingReports_Tabular = Template.instance().timeWritingReports_Tabular.get()
        if(timeWritingReports_Tabular) {
            return `${timeWritingReports_Tabular.employeeData.length * 100}%`
        }
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    'showingReportsForProjects': function() {
        return Template.instance().showingReportsForProjects.get()
    },
    'showingReportsForUnits': function() {
        return Template.instance().showingReportsForUnits.get()
    },
    'hsdfTimeSheetReportEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.hsdfTimeSheetReportEnabled
        }
    }
});

/*****************************************************************************/
/* TimeWritingReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeWritingReport.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.timeWritingReports = new ReactiveVar()
    self.timeWritingReports_Tabular = new ReactiveVar()

    self.showingReportsForProjects = new ReactiveVar()
    self.showingReportsForProjects_Tabular = new ReactiveVar()
    self.showingReportsForUnits = new ReactiveVar()

    self.selectedEmployees = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

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

    self.exportTimesForProjects_Tabular_ReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Employee Name", "Employee ID", "Location", "Total Time Field"]

        const projectsList = theData.projectCodes || []
        formattedHeader = formattedHeader.concat(projectsList)
        formattedHeader.push('Total %')
        //--
        let reportData = []

        theData.employeeData.forEach(employeeData => {
            let newEmployeeRow = []

            newEmployeeRow.push(employeeData.employeeFullName)
            newEmployeeRow.push(employeeData.employeeId)
            newEmployeeRow.push(employeeData.workLocation)
            newEmployeeRow.push(employeeData.totalDuration)

            projectsList.forEach(projectCode => {
                const projectDuration = _.find(employeeData.projects, project => {
                    if(project.project) {
                        return project.project === projectCode
                    } else {
                        return '---' === projectCode                
                    }
                })
                let projectDurationPercentage = ''

                if(projectDuration) {
                    if(employeeData.totalDuration > 0) {
                        let ratio = (projectDuration.duration / employeeData.totalDuration) * 100
                        projectDurationPercentage = `${ratio.toFixed(2)}%`
                    } else {
                        projectDurationPercentage = '---'
                    }
                } else {
                    projectDurationPercentage = '---'
                }
                newEmployeeRow.push(projectDurationPercentage)
            })
            newEmployeeRow.push('100%')
            reportData.push(newEmployeeRow)
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

    Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
        if(!err) {
            self.businessUnitCustomConfig.set(res)
        }
    })
});

Template.TimeWritingReport.onRendered(function () {
    //$('#example').DataTable();
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TimeWritingReport.onDestroyed(function () {
});
