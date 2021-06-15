/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionRetirementIndex.events({
    'click #createLocalErrandTransportRequisition': function(e, tmpl) {
        e.preventDefault()
        Modal.show('LocalErrandTransportRequisitionCreate')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        Modal.show('LocalErrandTransportRequisitionRetirementDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getLocalErrandTransportRequestsICreated(skip)
        Template.instance().localErrandTransportRequestsICreated.set(newPageOfProcurements)

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
/* LocalErrandTransportRequisitionRetirementIndex: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementIndex.helpers({
    'localErrandTransportRequestsICreated': function() {
        return Template.instance().localErrandTransportRequestsICreated.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = LocalErrandTransportRequisitions.find({$and : [
            {createdBy: Meteor.userId()},{ status : "Approved By Budget Holder" } ]}).count()

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

});

/*****************************************************************************/
/* LocalErrandTransportRequisitionRetirementIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionRetirementIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.localErrandTransportRequestsICreated = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)

    self.getLocalErrandTransportRequestsICreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return LocalErrandTransportRequisitions.find({
            $and : [
                {createdBy: Meteor.userId()},{ status : "Approved By Budget Holder" } ]
        }, options);
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

        let localErrandTransportRequestsCreatedSub = self.subscribe('LocalErrandTransportRequestsICreated', businessUnitId, limit, sort)
        if(localErrandTransportRequestsCreatedSub.ready()) {
            self.localErrandTransportRequestsICreated.set(self.getLocalErrandTransportRequestsICreated(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.LocalErrandTransportRequisitionRetirementIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.LocalErrandTransportRequisitionRetirementIndex.onDestroyed(function () {
});
