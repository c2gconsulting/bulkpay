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

/*****************************************************************************/
/* ProcurementRequisitionIndex: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.helpers({

});

/*****************************************************************************/
/* ProcurementRequisitionIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionIndex.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');

    self.subscribe('ProcurementRequisitionsICreated', businessUnitId)
    self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)

    self.autorun(function() {

    })
});

Template.ProcurementRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionIndex.onDestroyed(function () {
});
