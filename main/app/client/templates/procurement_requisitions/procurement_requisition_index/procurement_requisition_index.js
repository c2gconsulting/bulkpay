/*****************************************************************************/
/* ProcurementRequisition: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.ProcurementRequisitionIndex.events({

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
    console.log(`businessUnit: ${businessUnitId}`)

});

Template.ProcurementRequisitionIndex.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionIndex.onDestroyed(function () {
});
