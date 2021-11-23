
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

            let selectedEmployees = tmpl.selectedEmployees.get();
            let selectedTripCategories = tmpl.selectedTripCategories.get();
            let status = tmpl.status.get()
            let statusCategory = tmpl.statusCategory.get() || 'status'
            const byStatus = { key: statusCategory, value: status }

            Meteor.call('reports/travelRequest', Session.get('context'),
                startTimeAsDate, endTimeAsDate, selectedEmployees, selectedTripCategories, byStatus, function(err, res) {
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
            let selectedTripCategories = tmpl.selectedTripCategories.get()
            let status = tmpl.status.get()
            let statusCategory = tmpl.statusCategory.get()
            const byStatus = { key: statusCategory, value: status }

            Meteor.call('reports/travelRequest', Session.get('context'),
                startTimeAsDate, endTimeAsDate, selectedEmployees, selectedTripCategories, byStatus, function(err, res) {
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
    },
    'change [name="tripCategory"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.selectedTripCategories.set(selected)
    },
    'change [name="status"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.status.set(selected)
    },
    'change [name="statusCategory"]': (e, tmpl) => {
        e.preventDefault()
        tmpl.statusCategory.set(e.target.value)
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
    'getTravelcityName': function(fromId) {
        const travelcity = Travelcities.findOne({_id: fromId})

        if(travelcity) {
            return travelcity.name
        }
    },
    status: function () {
        return ["Cancelled","Draft","Pending","Approved By HOD", "Rejected By HOD","Approved By MD","Rejected By MD"]
    },
    extensionStatus: function () {
        return ["Cancelled","Pending","Approved By HOD", "Rejected By HOD","Approved By MD","Rejected By MD"]
    },
    retirementStatus: function () {
        return ["Not Retired","Draft","Retirement Submitted","Retirement Approved By HOD", "Retirement Rejected By HOD","Retirement Approved Finance","Retirement Rejected Finance"]
    },
    statusCategory: function () {
        return Template.instance().statusCategory.get()
    },
    'getHotelName': function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
        return hotelId || 'I do not need a Hotel'
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
    'getStateById': function(_id){
        return (Meteor.users.findOne({_id: _id})).profile.fullName;
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
    'tripData':function(trips){
      if (trips && trips.length > 0) {
        return trips[0];
      }
    }
});

/*****************************************************************************/
/* TravelRequestReport: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequestReport.onCreated(function () {
    let self = this;
  let businessUnitId = Session.get('context')
  self.subscribe("travelcities", Session.get('context'));
  self.subscribe("hotels", Session.get('context'));
  self.subscribe("allEmployees",  Session.get('context'));


    self.travelRequestReports = new ReactiveVar()

    self.selectedEmployees = new ReactiveVar()
    self.selectedTripCategories = new ReactiveVar()
    self.status = new ReactiveVar()
    self.statusCategory = new ReactiveVar('status')
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

    self.getSupervisorNameById = function(supervisorId) {
        let supervisor = Meteor.users.findOne({_id: supervisorId})
        if(supervisor) {
            return supervisor.profile.fullName || '---'
        }
    }

    self.getBudgetHolderNameById = function(budgetHolderId) {
        let budgetHolder = Meteor.users.findOne({_id: budgetHolderId})
        if(budgetHolder) {
            return budgetHolder.profile.fullName || '---'
        }
    }

    self.getBudgetName = function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    }

    self.getHotelName = function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
    }

    self.getTravelcityName = function(fromId) {
        const travelcity = Travelcities.findOne({_id: fromId})

        if(travelcity) {
            return travelcity.name
        }
    }
    self.getTravelcityName = function(toId) {
        const travelcity = Travelcities.findOne({_id: toId})

        if(travelcity) {
            return travelcity.name
        }
    }

    self.exportProcurementReportData = function(theData, startTime, endTime) {
      //  let formattedHeader = ["Description", "Created By","Date required", "Status"]
        // let formattedHeader = ["From", "To","Hotel", "Departure Date", "Return Date", "Description", "Created By","Date required","Status","Retirement Status","Budget holder","Supervisor","Budget code","Total Trip Cost NGN","Total Trip Cost USD"]
        let formattedHeader = ["Company code", "Name of Requester", "Name of Approver", "Name of Traveller", "Mode of transport", "Foreign/Local", "Department/Project", "Date of request", "Trip Start date", "Trip End date", "Cost center",
        "Description", "Amount NGN","Amount USD", "Amount Flight", "Amount Security", "Amount Logistics", "Amount Accommodation", "Per Diem (NGN)", "Per Diem (USD)", "Client related", "Driver", "Vendor"]

        let reportData = []

        theData.forEach(aDatum => {
            // reportData.push([aDatum.description, aDatum.createdByFullName, aDatum.createdAt,
            //     aDatum.status])
// reportData.push([self.getTravelcityName(aDatum.trips[0].fromId),self.getTravelcityName(aDatum.trips[0].toId), self.getHotelName(aDatum.trips[0].hotelId),
//   aDatum.trips[0].departureDate,aDatum.trips[0].returnDate,aDatum.description,aDatum.createdByFullName,aDatum.createdAt,aDatum.status,aDatum.retirementStatus,self.getBudgetHolderNameById(aDatum.budgetHolderId),  self.getSupervisorNameById(aDatum.supervisorId),self.getBudgetName(aDatum.budgetCodeId),aDatum.totalTripCostNGN,aDatum.totalTripCostUSD])
//         })

reportData.push(['OSL/FRAZ/CLIENT', aDatum.createdByFullName, "Achama Eluwa", "Akolade Adesanmi", aDatum.trips[0].transportationMode, aDatum.destinationType, aDatum.costCenter, aDatum.createdAt, aDatum.trips[0].departureDate, aDatum.trips[0].returnDate, "", 
aDatum.description, aDatum.totalTripCostNGN,aDatum.totalTripCostUSD, aDatum.totalFlightCostUSD, aDatum.totalSecurityCostNGN, 0, aDatum.totalHotelCostNGN, aDatum.totalEmployeePerdiemNGN, aDatum.totalEmployeePerdiemUSD, "", "", ""])
        })

        Hub825Explorer.exportAllData({fields: formattedHeader, data: reportData},
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
