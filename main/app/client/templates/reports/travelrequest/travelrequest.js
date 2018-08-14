
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
                  console.log(res)
                resetButton()
                if(res){
                //  console.log(this)
                    tmpl.travelRequestReports.set(res)
            //        console.log(travelRequestReports)
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
    'getBudgetName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    },
    'getBudgetHolderNameById': function(budgetHolderId){
        return (Meteor.users.findOne({_id: budgetHolderId})).profile.fullName;
    },
    'getSupervisorNameById': function(supervisorId){
        return (Meteor.users.findOne({_id: supervisorId})).profile.fullName;
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
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        }
    },
    'isLastIndex': function(array, currentIndex) {
        return (currentIndex === (array.length - 1))
    },
    // 'totalTripCostNGN': function() {
    //     return Template.instance().totalTripCostNGN.get()
    // },

    'getSupervisor': function(procurement) {
        return Template.instance().getSupervisor(procurement)
    },
    limitText: function(text) {
        if(text && text.length > 10) {
            return `${text.substring(0, 30)} ...`
        }
        return text
    },
});

/*****************************************************************************/
/* TravelRequestReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequestReport.onCreated(function () {
    let self = this;
  let businessUnitId = Session.get('context')
    self.travelRequestReports = new ReactiveVar()

    self.selectedEmployees = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()
    self.currentTravelRequest = new ReactiveVar()
    self.totalTripCost = new ReactiveVar(0)

        let invokeReason = {}
        invokeReason.requisitionId = Router.current().params.query.requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null


    self.getDateFromString = function(str1) {
        let theDate = moment(str1);
        return theDate.add('hours', 1).toDate()
    }

    self.getSupervisor = function(procurement) {
        let supervisor = Meteor.users.findOne({
            'employeeProfile.employment.position': procurement.supervisorPositionId
        })
        if(supervisor) {
            return supervisor.profile.fullName || '---'
        }
    }

    self.exportProcurementReportData = function(theData, startTime, endTime) {
        let formattedHeader = ["Description", "Created By","Date required", "Status"]

        let reportData = []

        theData.forEach(aDatum => {
            reportData.push([aDatum.description, aDatum.createdByFullName, aDatum.createdAt,
                aDatum.status])
        })

        BulkpayExplorer.exportAllData({fields: formattedHeader, data: reportData},
            `Travel Requests Report ${startTime} - ${endTime}`);
    }
    self.autorun(function() {

        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, customConfig) {
            if(!err) {
                self.businessUnitCustomConfig.set(customConfig)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId})
            self.currentTravelRequest.set(travelRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequestReport.onRendered(function () {
    self.$('select.dropdown').dropdown();

    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequestReport.onDestroyed(function () {
});
