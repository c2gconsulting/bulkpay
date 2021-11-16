/*****************************************************************************/
/* TravelRequisition2GCEOIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2GCEOIndex.events({
    'click #createTravelRequisition  ': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisition2Create')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        Modal.show('TravelRequisition2GCEODetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsByGCEO(skip)
        Template.instance().travelRequestsByGCEO.set(newPageOfProcurements)

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
/* TravelRequisition2GCEOIndex: Helpers */
/*****************************************************************************/
Template.TravelRequisition2GCEOIndex.helpers({
    'travelRequestsByGCEO': function() {
        return Template.instance().travelRequestsByGCEO.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        const { gceoCondition } = Core.getTravelQueries()
        let totalNum = TravelRequisition2s.find(gceoCondition).count()

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

    'totalTripCostNGN': function(currentTravelRequest) {
        if(currentTravelRequest) {
            currentTravelRequest.totalTripCostNGN = totalTripCostNGN;

            return totalTripCostNGN;
        }
    },

});

/*****************************************************************************/
/* TravelRequisition2GCEOIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2GCEOIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsByGCEO = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)

    self.getTravelRequestsByGCEO = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        //options.sort["status"] = sortDirection;
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip
        const { gceoCondition } = Core.getTravelQueries()
        return TravelRequisition2s.find(gceoCondition, options);
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let travelRequestsByGCEOSub = self.subscribe('TravelRequestsByGCEO', businessUnitId, Meteor.userId());
        if(travelRequestsByGCEOSub.ready()) {
            self.travelRequestsByGCEO.set(self.getTravelRequestsByGCEO(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.TravelRequisition2GCEOIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisition2GCEOIndex.onDestroyed(function () {
});
