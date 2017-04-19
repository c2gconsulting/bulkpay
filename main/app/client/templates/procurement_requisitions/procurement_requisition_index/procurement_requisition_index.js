/*****************************************************************************/
/* ProcurementRequisition: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionIndex.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('ProcurementRequisitionCreate')
    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* ProcurementRequisitionIndex: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.helpers({
    'procurementsICreated': function() {
        return Template.instance().procurementsICreated();
    }
});

/*****************************************************************************/
/* ProcurementRequisitionIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.loaded = new ReactiveVar(0);
    self.limit = new ReactiveVar(10);
    //--
    self.procurementsToApprove = new ReactiveVar()

    let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)

    self.autorun(function() {
        let limit = self.limit.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;

        let procurementsCreatedSub = self.subscribe('ProcurementRequisitionsICreated', businessUnitId, limit, sort)
        if (procurementsCreatedSub.ready()) {
            self.loaded.set(10);
        }
        //--
        if(procurementsToApproveSub.ready()) {
            console.log(`ProcurementsSub is ready`)
            let currentUser = Meteor.user()
            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({supervisorPositionId: currentUserPosition}).fetch();
                console.log(`procurementsToApprove: ${JSON.stringify(procurementsToApprove)}`)
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
    })

    self.procurementsICreated = function() {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = self.loaded.get();

        return ProcurementRequisitions.find({createdBy: Meteor.userId()}, options);
    }
});

Template.ProcurementRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionIndex.onDestroyed(function () {
});
