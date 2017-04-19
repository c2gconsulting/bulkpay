/*****************************************************************************/
/* ProcurementRequisition: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionIndex.events({
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

        let newPageOfProcurements = Template.instance().getProcurementsICreated(skip)
        Template.instance().procurementsICreated.set(newPageOfProcurements)

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
/* ProcurementRequisitionIndex: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.helpers({
    'procurementsICreated': function() {
        return Template.instance().procurementsICreated.get()
    },
    'numberOfPages': function() {
        let limit = Template.instance().NUMBER_PER_PAGE.get()
        let totalNum = ProcurementRequisitions.find({createdBy: Meteor.userId()}).count()
        console.log(`totalNum: ${totalNum}`)

        return Math.ceil(limit, totalNum)
    },
    'currentPage': function() {
        return Template.instance().currentPage.get()
    }
});

/*****************************************************************************/
/* ProcurementRequisitionIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.NUMBER_PER_PAGE = new ReactiveVar(3);
    self.currentPage = new ReactiveVar(0);
    //--
    self.procurementsICreated = new ReactiveVar()
    self.procurementsToApprove = new ReactiveVar()

    // let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)


    self.getProcurementsICreated = function(skip) {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.NUMBER_PER_PAGE.get();
        options.skip = skip

        return ProcurementRequisitions.find({createdBy: Meteor.userId()}, options);
    }

    self.autorun(function() {
        let limit = self.NUMBER_PER_PAGE.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let procurementsCreatedSub = self.subscribe('ProcurementRequisitionsICreated', businessUnitId, limit, sort)
        if(procurementsCreatedSub.ready()) {
            self.procurementsICreated.set(self.getProcurementsICreated(0))
        }
        //--
        // if(procurementsToApproveSub.ready()) {
        //     console.log(`ProcurementsSub is ready`)
        //     let currentUser = Meteor.user()
        //     if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
        //         let currentUserPosition = currentUser.employeeProfile.employment.position
        //
        //         let procurementsToApprove = ProcurementRequisitions.find({supervisorPositionId: currentUserPosition}).fetch();
        //         console.log(`procurementsToApprove: ${JSON.stringify(procurementsToApprove)}`)
        //         self.procurementsToApprove.set(procurementsToApprove)
        //     }
        // }
    })

});

Template.ProcurementRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionIndex.onDestroyed(function () {
});
