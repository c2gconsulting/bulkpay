

/*****************************************************************************/
/* ProcurementRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionCreate.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('ProcurementRequisitionCreate')
    },
    'click #new-requisition-save-draft': function(e, tmpl) {
        e.preventDefault()
        console.log('Inside new-requisition-save-draft')


    }
});

/*****************************************************************************/
/* ProcurementRequisitionCreate: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionCreate.helpers({

});

/*****************************************************************************/
/* ProcurementRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionCreate.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');
    console.log(`businessUnit: ${businessUnitId}`)

});

Template.ProcurementRequisitionCreate.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionCreate.onDestroyed(function () {
});
