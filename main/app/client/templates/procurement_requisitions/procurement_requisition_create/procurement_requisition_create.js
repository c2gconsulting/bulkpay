

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

        let requisitionDoc = {}

        let description = $("input[name=description]").val()
        let dateRequired = $("input[name=dateRequired]").val()
        let requisitionReason = $("input[name=requisitionReason]").val()

        if(description && description.length > 0) {
            console.log(`description: ${description}`)
            requisitionDoc.description = description
        }
        if(dateRequired && dateRequired.length > 0) {
            let dateRequiredAsDateObj = new Date(dateRequired)
            // console.log(`Date required: ${dateRequiredAsDateObj.toString()}`)
            requisitionDoc.dateRequired = dateRequired
        }
        if(requisitionReason && requisitionReason.length > 0) {
            console.log(`requisitionReason: ${requisitionReason}`)
            requisitionDoc.requisitionReason = requisitionReason
        }

        Meteor.call('ProcurementRequisition/createDraft', Session.get('context'), requisitionDoc, function(err, res) {
            if(!err) {
                console.log(`Res: ${JSON.stringify(res)}`)
                swal('Success', 'Requisition Draft saved', 'success')
            } else {
                console.log(`Err: ${JSON.stringify(err)}`)
            }
        })
    },
    'click #new-requisition-create': function(e, tmpl) {
        e.preventDefault()
        console.log('Inside new-requisition-create')

        let dateRequired= $("input[name=dateRequired]").val()
        if(dateRequired && dateRequired.length > 0) {
            let dateRequiredAsDateObj = new Date(dateRequired)
            console.log(`Date required: ${dateRequiredAsDateObj.toString()}`)
        } else {
            swal('Validation error', 'Date field should not be empty', 'error')
        }
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
