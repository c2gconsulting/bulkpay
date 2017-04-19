/*****************************************************************************/
/* ProcurementRequisitionApprovalList: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionApprovalList.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('ProcurementRequisitionCreate')
    },
    'click .goToPage': function(e, tmpl) {
        let pageNum = e.currentTarget.getAttribute('data-pageNum')
        console.log(`pageNum: ${pageNum}`)
        let pageNumAsInt = parseInt(pageNum)
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let skip = limit * pageNumAsInt
        console.log(`skip: ${skip}`)

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

            console.log(`totalNum: ${totalNum}`)

            return Math.ceil(limit, totalNum)
        }
        return 0;
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    }
});

/*****************************************************************************/
/* ProcurementRequisitionApprovalList: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionApprovalList.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(3);
    self.currentPage = new ReactiveVar(0);
    //--
    self.procurementsToApprove = new ReactiveVar()

    self.getProcurementsToApprove = function(skip) {
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

            return ProcurementRequisitions.find({supervisorPositionId: currentUserPosition}, options);
        }
        return null
    }

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
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({supervisorPositionId: currentUserPosition}).fetch();
                self.procurementsToApprove.set(self.getProcurementsToApprove(0))
            }
        }
    })

});

Template.ProcurementRequisitionApprovalList.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionApprovalList.onDestroyed(function () {
});
