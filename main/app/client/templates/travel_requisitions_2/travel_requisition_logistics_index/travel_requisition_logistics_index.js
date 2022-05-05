/*****************************************************************************/
/* TravelRequisition2LogisticsIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisition2LogisticsIndex.events({
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

        Modal.show('TravelRequisition2LogisticsDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsByLogistics(skip)
        Template.instance().travelRequestsByLogistics.set(newPageOfProcurements)

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
/* TravelRequisition2LogisticsIndex: Helpers */
/*****************************************************************************/
Template.TravelRequisition2LogisticsIndex.helpers({
    'travelRequestsByLogistics': function() {
        return Template.instance().travelRequestsByLogistics.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        const { logisticsCondition } = Core.getTravelQueries()
        // {$and : [
        //     { logisticsId: Meteor.userId()},
        //     { $or : [{ status : "Approved By HOD" }, { status : "Processed By Logistics" }, { status : "Approved By GCOO" }, { status : "Approved By GCEO" }, { status : "Processed By BST" }] }
        // ]}
        let totalNum = TravelRequisition2s.find(logisticsCondition).count()

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
    },
    getStatus: function (status) {
      const { APPROVED_BY_HOC, APPROVED_BY_HOD, REJECTED_BY_HOC, REJECTED_BY_HOD } = Core.ALL_TRAVEL_STATUS;
      let newStatus = (status || '').replace(APPROVED_BY_HOC, APPROVED_BY_HOD);
      newStatus = (newStatus || '').replace(REJECTED_BY_HOC, REJECTED_BY_HOD);
      return newStatus;
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
/* TravelRequisition2LogisticsIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisition2LogisticsIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    self.travelRequestsByLogistics = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    self.totalTripCost = new ReactiveVar(0)

    self.getTravelRequestsByLogistics = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        //options.sort["status"] = sortDirection;
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip
        const { logisticsCondition } = Core.getTravelQueries()
        // {
        //     $and : [
        //         { logisticsId: Meteor.userId()},
        //         { $or : [{ status : "Approved By HOD" }, { status : "Processed By Logistics" }, { status : "Approved By GCOO" }, { status : "Approved By GCEO" }, { status : "Processed By BST" }] }
        //     ]
        // }
        return TravelRequisition2s.find(logisticsCondition, options);
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let travelRequestsByLogisticsSub = self.subscribe('TravelRequestsByLogistics', businessUnitId, Meteor.userId());
        if(travelRequestsByLogisticsSub.ready()) {
            self.travelRequestsByLogistics.set(self.getTravelRequestsByLogistics(0))
        }
        //--
        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)
        }
    })
});

Template.TravelRequisition2LogisticsIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisition2LogisticsIndex.onDestroyed(function () {
});
