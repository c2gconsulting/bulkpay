
/*****************************************************************************/
/* ProcurementRequisitionDetail: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';


/*
* invokeReason
* {
*   requisitionId: String,
*   reason: 'edit' | 'approve'
*   approverId: optional
* }
* */


Template.ProcurementRequisitionDetail.events({
    'click #new-requisition-save-draft': function(e, tmpl) {
        e.preventDefault()

    },
    'click #new-requisition-create': function(e, tmpl) {
        e.preventDefault()

    }
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* ProcurementRequisitionDetail: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionDetail.helpers({
    'procurementDetails': function() {
        return Template.instance().procurementDetails.get()
    },
    'isInEditMode': function() {
        return Template.instance().isInEditMode.get()
    },
    'isInApproveMode': function() {
        return Template.instance().isApproveMode.get()
    }
});

/*****************************************************************************/
/* ProcurementRequisitionDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.procurementDetails = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()

    let invokeReason = self.data;
    console.log(`invokeReason: ${JSON.stringify(invokeReason)}`)
    if(invokeReason.reason === 'edit') {
        self.isInEditMode.set(true)
    }
    if(invokeReason.reason === 'approve') {
        self.isInApproveMode.set(true)
    }

    self.autorun(function() {
        let procurementSub = self.subscribe('ProcurementRequisition', invokeReason.requisitionId)
        if(procurementSub.ready()) {
            console.log(`procurement subscription ready `)
            let procurementDetails = ProcurementRequisitions.findOne({_id: invokeReason.requisitionId})
            self.procurementDetails.set(procurementDetails)
        }
    })
});

Template.ProcurementRequisitionDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let procurementDetails = self.procurementDetails.get()
    if(procurementDetails) {
        if(procurementDetails.status !== 'Draft') {
            if(self.isInEditMode()) {
                swal('Error', "Sorry, you can't edit this procurement requisition. ", 'error')
            }
        } else if(procurementDetails.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(procurementDetails.status === 'Approve') {
            if(self.isInEditMode()) {
                swal('Error', "Sorry, you can't edit this procurement requisition. It has been approved", 'error')
            }
        }
    }
});

Template.ProcurementRequisitionDetail.onDestroyed(function () {
});
