/*****************************************************************************/
/* TravelRequisitionIndex: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionIndex.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()
        Modal.show('TravelRequisitionCreate')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        
        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = null

        Modal.show('TravelRequisitionDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsICreated(skip)
        Template.instance().travelRequestsICreated.set(newPageOfProcurements)

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
/* TravelRequisitionIndex: Helpers */
/*****************************************************************************/
Template.TravelRequisitionIndex.helpers({
    'travelRequestsICreated': function() {
        return Template.instance().travelRequestsICreated.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = TravelRequisitions.find({createdBy: Meteor.userId()}).count()

        let result = Math.floor(totalNum/limit)
        var remainder = totalNum % limit;
        if (remainder > 0)
            result += 2;
        return result;
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    },
    'getTotalTripCost': function(travelRequestDetails) {
        if(travelRequestDetails && travelRequestDetails.tripCosts) {
            let flightCost = travelRequestDetails.tripCosts.flightCost || 0
            let accommodationCost = travelRequestDetails.tripCosts.accommodationCost || 0
            let localTransportCost = travelRequestDetails.tripCosts.localTransportCost || 0
            let perDiemCost = travelRequestDetails.tripCosts.perDiemCost || 0
            let miscCosts = travelRequestDetails.tripCosts.miscCosts || 0
            let roadCost = travelRequestDetails.tripCosts.roadCost || 0
            let feedingCost = travelRequestDetails.tripCosts.feedingCost || 0

            let totalTripCost = flightCost + accommodationCost + localTransportCost + 
                roadCost + feedingCost + perDiemCost + miscCosts

            return totalTripCost
        } else  {
            return 0
        }
    }
});

/*****************************************************************************/
/* TravelRequisitionIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    self.travelRequestsICreated = new ReactiveVar()

    self.getTravelRequestsICreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return TravelRequisitions.find({createdBy: Meteor.userId()}, options);
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let travelRequestsCreatedSub = self.subscribe('TravelRequestsICreated', businessUnitId, limit, sort)
        if(travelRequestsCreatedSub.ready()) {
            self.travelRequestsICreated.set(self.getTravelRequestsICreated(0))
        }
    })
});

Template.TravelRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TravelRequisitionIndex.onDestroyed(function () {
});
