/*****************************************************************************/
/* ProcurementRequisitionApprovalList: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionApprovalList.events({
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        console.log(`pageNum: ${pageNum}`)
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt

        let newPageOfProcurements = Template.instance().getProcurementsToApprove(skip)
        Template.instance().procurementsToApprove.set(newPageOfProcurements)

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
/* ProcurementRequisitionApprovalList: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionApprovalList.helpers({
    'procurementsICreated': function() {
        return Template.instance().procurementsToApprove.get()
    },
    'numberOfPages': function() {
        let currentUser = Meteor.user()
        if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let currentUserPosition = currentUser.employeeProfile.employment.position

            let limit = Template.instance().NUMBER_PER_PAGE.get()
            let totalNum = ProcurementRequisitions.find({supervisorPositionId: currentUserPosition}).count();

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
/* ProcurementRequisitionApprovalList: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionApprovalList.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.businessUnitCustomConfig = new ReactiveVar()

    self.NUMBER_PER_PAGE = new ReactiveVar(10);
    self.currentPage = new ReactiveVar(0);
    //--
    self.procurementsToApprove = new ReactiveVar()

    Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
        if(!err) {
            self.businessUnitCustomConfig.set(res)
        }
    })

    self.getProcurementsToApprove = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        let currentUser = Meteor.user()
        let businessUnitCustomConfig = self.businessUnitCustomConfig.get()
        if(businessUnitCustomConfig && businessUnitCustomConfig.isTwoStepApprovalEnabled) {
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                return ProcurementRequisitions.find({
                    $or: [
                        {
                            alternativeSupervisorPositionId: currentUserPosition,
                            $or: [{status : 'PartiallyApproved'}, {status: 'PartiallyRejected'}],
                        }, 
                        {
                            supervisorPositionId : currentUserPosition,
                            status: 'Pending'
                        }
                    ],
                }, options);
            }
        } else {
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                return ProcurementRequisitions.find({
                    $or: [{supervisorPositionId : currentUserPosition}, 
                            {alternativeSupervisorPositionId: currentUserPosition}],                
                    status: 'Pending'
                }, options);
            }
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

        let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId, limit, sort)
        //--
        if(procurementsToApproveSub.ready()) {
            let currentUser = Meteor.user()
            if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                
                self.procurementsToApprove.set(self.getProcurementsToApprove(0))
            }
        }
    })
});

Template.ProcurementRequisitionApprovalList.onRendered(function () {
    $('select.dropdown').dropdown();
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.ProcurementRequisitionApprovalList.onDestroyed(function () {
});
