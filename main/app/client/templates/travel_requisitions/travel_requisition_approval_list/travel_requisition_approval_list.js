/*****************************************************************************/
/* TravelRequisitionApprovalList: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionApprovalList.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('TravelRequisitionCreate')
    },
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('TravelRequisitionDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        console.log(`pageNum: ${pageNum}`)
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt
        console.log(`skip: ${skip}`)

        let newPageOfProcurements = Template.instance().getTravelRequestsToApprove(skip)
        Template.instance().travelRequestsToApprove.set(newPageOfProcurements)

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
/* TravelRequisitionApprovalList: Helpers */
/*****************************************************************************/
Template.TravelRequisitionApprovalList.helpers({
    'travelRequestsToApprove': function() {
        return Template.instance().travelRequestsToApprove.get()
    },
    'numberOfPages': function() {
        let currentUser = Meteor.user()
        if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            let limit = Template.instance().NUMBER_PER_PAGE.get()
            let totalNum = TravelRequisitions.find({supervisorPositionId: currentUserPosition}).count();
            console.log(`totalNum: ${totalNum}`)

            let result = Math.floor(totalNum/limit)
            var remainder = totalNum % limit;
            if (remainder > 0)
                result += 2;
            return result;
        }
        return 0;
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
/* TravelRequisitionApprovalList: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionApprovalList.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    self.travelRequestsToApprove = new ReactiveVar()

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

            return TravelRequisitions.find({supervisorPositionId: currentUserPosition, status: 'Pending'}, options);
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

        let travelRequestsToApproveSub = self.subscribe('TravelRequestsToApprove', businessUnitId, limit, sort)
        //--
        if(travelRequestsToApproveSub.ready()) {
            let currentUser = Meteor.user()
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                self.travelRequestsToApprove.set(self.getTravelRequestsToApprove(0))
            }
        }
    })

});

Template.TravelRequisitionApprovalList.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.TravelRequisitionApprovalList.onDestroyed(function () {
});
