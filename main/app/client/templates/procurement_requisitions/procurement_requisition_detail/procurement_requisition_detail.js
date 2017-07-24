
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
    'click #requisition-save-draft': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let description = $("input[name=description]").val()
            let dateRequired = $("input[name=dateRequired]").val()
            let requisitionReason = $("textarea[name=requisitionReason]").val()

            if(description && description.length > 0) {
                let requisitionDoc = {}
                requisitionDoc.description = description
                if(dateRequired && dateRequired.length > 0)
                    requisitionDoc.dateRequired = new Date(dateRequired)
                else
                    requisitionDoc.dateRequired = null
                requisitionDoc.requisitionReason = requisitionReason

                let businessUnitId = Session.get('context')

                Meteor.call('ProcurementRequisition/createDraft', businessUnitId, requisitionDoc, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Requisition Draft saved", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        swal('Validation error', err.message, 'error')
                    }
                })
            } else {
                swal('Validation error', "Please fill a description", 'error')
            }
        }
    },
    'click #requisition-create': function(e, tmpl) {
        e.preventDefault()

        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let description = $("input[name=description]").val()
            let dateRequired = $("input[name=dateRequired]").val()
            let requisitionReason = $("textarea[name=requisitionReason]").val()

            let validation = tmpl.areInputsValid(description, dateRequired, requisitionReason)
            if(validation === true) {
                let requisitionDoc = {}

                requisitionDoc.description = description
                requisitionDoc.dateRequired = new Date(dateRequired)
                requisitionDoc.requisitionReason = requisitionReason

                let businessUnitId = Session.get('context')

                Meteor.call('ProcurementRequisition/create', businessUnitId, requisitionDoc, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Requisition is now pending treatment", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        // console.log(`Err: ${JSON.stringify(err)}`)
                        swal('Validation error', err.message, 'error')
                    }
                })
            } else {
                swal('Validation error', validation, 'error')
            }
        }
    },
    'click #requisition-approve': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/approve', businessUnitId, procurementDetails._id, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition treated", type: "success",
                        confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                    }, () => {
                        Modal.hide()
                    })
                } else {
                    swal('Validation error', err.message, 'error')
                }
            })
        }
    },
    'click #requisition-reject': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/reject', businessUnitId, procurementDetails._id, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition rejected", type: "success",
                        confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                    }, () => {
                        Modal.hide()
                    })
                } else {
                    swal('Validation error', err.message, 'error')
                }
            })
        }
    },
    'click #requisition-print': function(e, tmpl) {
        // $("#ProcurementRequisitionDetailModal").printThis({
        //     importStyle: true
        // });
        let businessUnitLogoUrl = Template.instance().businessUnitLogoUrl.get()
        console.log('businessUnitLogoUrl: ', businessUnitLogoUrl)

        let procurementDetails = Template.instance().procurementDetails.get()

        let user = Meteor.users.findOne(procurementDetails.createdBy)
        let employeeFullName = ''
        let employeeId = ''
        if(user) {
            employeeFullName = user.profile.fullName
            employeeId = user.employeeProfile.employeeId;
        }

        let firstTransform = $("#ProcurementRequisitionDetailModal")
        .clone()
        .remove('.panel-footer')
        .find('.panel-title')
        .html('Purchase Requisition')
        .end()
        .find('.panel-title')
        .prepend(`
            <img src='${businessUnitLogoUrl}' class='img-responsive mb10' alt='' />
        `)
        // .prepend(`
        //     <img src='${businessUnitLogoUrl}' class='img-responsive mb10' alt='' />
        //     <h5 class="subtitle mb10">Employee Full Name: ${employeeFullName}</h5>
        //     <h5 class="subtitle mb10">Employee No: ${employeeId}</h5>
        // `)
        .end()

        if(businessUnitLogoUrl) {
            // firstTransform
            // .find('.panel-title')
            // .prepend(`
            //     <h5 class="subtitle mb10">Employee Full Name: ${employeeFullName}</h5>
            //     <h5 class="subtitle mb10">Employee No: ${employeeId}</h5>`
            // )

            // .end()
            // .end()
        }

        firstTransform.printThis({
            importStyle: true
        });
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
        return Template.instance().isInApproveMode.get()
    },
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
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

    self.businessUnitLogoUrl = new ReactiveVar()


    self.autorun(function() {
        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let procurementSub = self.subscribe('ProcurementRequisition', invokeReason.requisitionId)

        if(procurementSub.ready()) {
            let procurementDetails = ProcurementRequisitions.findOne({_id: invokeReason.requisitionId})
            self.procurementDetails.set(procurementDetails)
            
            if(procurementDetails.unitId) {
                self.subscribe('getEntity', procurementDetails.unitId)
            }
        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })

    self.areInputsValid = function(description, dateRequired, requisitionReason) {
        let errMsg = null
        if(!description || description.length < 1) {
            errMsg = "Please fill description"
            return errMsg
        }
        if(!dateRequired || dateRequired.length < 1) {
            errMsg = "Please fill date required"
            return errMsg
        }
        if(!requisitionReason || requisitionReason.length < 1) {
            errMsg = "Please fill requisition reason"
            return errMsg
        }
        return true
    }
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
