/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementAdminIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionRetirementAdminIndex.events({
    'click #createLocalErrandTransportRequisition  ': function(e, tmpl) {
        e.preventDefault()
        Modal.show('LocalErrandTransportRequisition2Create')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        const status = $("#status_" + requisitionId).html();

        Modal.show('LocalErrandTransportRequisitionRetirementAdminDetail', invokeReason);

    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getLocalErrandTransportRequestsAdminCreated(skip)
        Template.instance().localErrandTransportRequestsAdminCreated.set(newPageOfProcurements)

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
/* LocalErrandTransportRequisitionRetirementAdminIndex: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementAdminIndex.helpers({
    getSupervisorFullName: (requisition) => {
        const userId = requisition.supervisorId

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    getBudgetHolderFullName: (requisition) => {
        const userId = requisition.budgetHolderId

        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'getBudgetCodeName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        } else {
            return 'Budget Code'
        }
    },
    'localErrandTransportRequestsAdminCreated': function() {
        return Template.instance().localErrandTransportRequestsAdminCreated.get()
    },
    'hasUnretiredTrips': function() {

        let unretiredCount = LocalErrandTransportRequisitions.find({
            $and : [
                { retirementStatus: "Not Retired"},
                { $or : [ { status : "Pending" }, { status : "Approved By Supervisor" }, { status : "Approved By Budget Holder"}] }
            ]}).count()
        console.log("Unretired Count: " + unretiredCount);
        if (unretiredCount > 0){
            return true;
        }else{
            return false;
        }

    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = LocalErrandTransportRequisitions.find({createdBy: Meteor.userId()}).count()

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

    'totalTripCostNGN': function(currentLocalErrandTransportRequest) {
        if(currentLocalErrandTransportRequest) {
            currentLocalErrandTransportRequest.totalTripCostNGN = totalTripCostNGN;

            return totalTripCostNGN;
        }
    },
    'getPrintUrl': function(currentLocalErrandTransportRequest) {
        if(currentLocalErrandTransportRequest) {
            return Meteor.absoluteUrl() + 'business/' + currentLocalErrandTransportRequest.businessId + '/localerrandtransportrequests/printrequisition?requisitionId=' + currentLocalErrandTransportRequest._id
        }
    }

});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementAdminIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementAdminIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')



    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.localErrandTransportRequestsAdminCreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)


    self.getLocalErrandTransportRequestsAdminCreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;



        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return LocalErrandTransportRequisitions.find({});

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

        let localErrandTransportRequestsCreatedSub = self.subscribe('LocalErrandTransportRequestsAdminCreated', businessUnitId, limit, sort)
        if(localErrandTransportRequestsCreatedSub.ready()) {
            self.localErrandTransportRequestsAdminCreated.set(self.getLocalErrandTransportRequestsAdminCreated(0))
            // const mainList = self.getLocalErrandTransportRequestsICreated(0).fetch();
            // self.localErrandTransportRequestsICreated.set(mainList)
            // console.log(mainList)
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.LocalErrandTransportRequisitionRetirementAdminIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.LocalErrandTransportRequisitionRetirementAdminIndex.onDestroyed(function () {
});
