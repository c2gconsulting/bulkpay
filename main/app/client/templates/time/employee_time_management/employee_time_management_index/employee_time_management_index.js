/*****************************************************************************/
/* EmployeeTimeRecordIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.EmployeeTimeRecordIndex.events({
    'click #createTimeRecord': function(e, tmpl) {
        e.preventDefault()
        Router.go('employee.time.management',{_id: Session.get('context')});
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();




        if ((status === "Draft") || (status === "Rejected By Supervisor") || (status === "Rejected By Budget Holder")){
          Router.go('employee.time.management',{_id: Session.get('context')});
        }else{
            Modal.show('TimeRecordDetail', invokeReason);
        }

    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTimeRecordsICreated(skip)
        Template.instance().timeRecordsICreated.set(newPageOfProcurements)

        Template.instance().currentPage.set(pageNumAsInt)
    },
    'click .paginateLeft': function(e, tmpl) {

    },
    'click .paginateRight': function(e, tmpl) {

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

Template.registerHelper('repeat', function(max) {
    return _.range(max - 1); // undescore.js but every range impl would work
});

/*****************************************************************************/
/* EmployeeTimeRecordIndex: Helpers */
/*****************************************************************************/
Template.EmployeeTimeRecordIndex.helpers({
    'timeRecordsICreated': function() {
        return Template.instance().timeRecordsICreated.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = TravelRequisition2s.find({createdBy: Meteor.userId()}).count()

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },

    getMonth: function (index) {
        if (index == 1) {
            return 'January'
        } else if (index == 2) {
            return 'Feburary'
        } else if (index == 2) {
            return 'March'
        } else if (index == 4) {
            return 'April'
        } else if (index == 5) {
            return 'May'
        } else if (index == 6) {
            return 'June'
        } else if (index == 7) {
            return 'July'
        } else if (index == 8) {
            return 'August'
        } else if (index == 9) {
            return 'September'
        } else if (index == 10) {
            return 'October'
        } else if (index == 11) {
            return 'November'
        } else if (index == 12) {
            return 'December'
        }
    },
    'getPrintUrl': function(currentTravelRequest) {
        if(currentTravelRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentTravelRequest.businessId + '/travelrequests2/printrequisition?requisitionId=' + currentTravelRequest._id
        }
    }

});

/*****************************************************************************/
/* EmployeeTimeRecordIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeTimeRecordIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.timeRecordsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)

    self.getTimeRecordsICreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

      return TimeRecord.find({createdBy: Meteor.userId()}, options);
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let employeeProfile = Meteor.user().employeeProfile
        if(employeeProfile && employeeProfile.employment && employeeProfile.employment.position) {
            let userPositionId = employeeProfile.employment.position

            let positionSubscription = self.subscribe('getEntity', userPositionId)
        }

        let timeRecordsCreatedSub = self.subscribe('TimeRecordsICreated', businessUnitId, limit, sort)

        if(timeRecordsCreatedSub.ready()) {
            self.timeRecordsICreated.set(self.getTimeRecordsICreated(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.EmployeeTimeRecordIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.EmployeeTimeRecordIndex.onDestroyed(function () {
});
