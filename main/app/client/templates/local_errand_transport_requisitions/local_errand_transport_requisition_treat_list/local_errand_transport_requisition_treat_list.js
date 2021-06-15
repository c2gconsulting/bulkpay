/*****************************************************************************/
/* LocalErrandTransportRequisitionTreatList: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.LocalErrandTransportRequisitionTreatList.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('LocalErrandTransportRequisitionCreate')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'treat'
        invokeReason.approverId = Meteor.userId()

        Modal.show('LocalErrandTransportRequisitionDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getTravelRequestsToApprove(skip)
        Template.instance().localErrandTransportRequestsToApprove.set(newPageOfProcurements)

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
/* LocalErrandTransportRequisitionTreatList: Helpers */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionTreatList.helpers({
    'localErrandTransportRequestsToApprove': function() {
        return Template.instance().localErrandTransportRequestsToApprove.get()
    },
    'numberOfPages': function() {
        let currentUser = Meteor.user()
        if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            let limit = Template.instance().NUMBER_PER_PAGE.get()
            let totalNum = LocalErrandTransportRequisitions.find({supervisorPositionId: currentUserPosition}).count();

            let result = Math.floor(totalNum/limit)
            var remainder = totalNum % limit;
            if (remainder > 0)
                result += 2;
            return result;
        }
        return 0;
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy
        
        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    },
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    }
});

/*****************************************************************************/
/* LocalErrandTransportRequisitionTreatList: Lifecycle Hooks */
/*****************************************************************************/
Template.LocalErrandTransportRequisitionTreatList.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    self.localErrandTransportRequestsToApprove = new ReactiveVar()

    self.getTravelRequestsToApprove = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        let currentUser = Meteor.user()
        if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            return LocalErrandTransportRequisitions.find({
                status: 'Approved'
            }, options);
        }
        return null
    }

    self.subscribe('getCostElement', businessUnitId)

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let localErrandTransportRequestsToApproveSub = self.subscribe('TravelRequestsToTreat', businessUnitId, limit, sort)
        //--
        if(localErrandTransportRequestsToApproveSub.ready()) {
            let currentUser = Meteor.user()
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                self.localErrandTransportRequestsToApprove.set(self.getTravelRequestsToApprove(0))
            }
        }
    })
});

Template.LocalErrandTransportRequisitionTreatList.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.LocalErrandTransportRequisitionTreatList.onDestroyed(function () {
});
