
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

            let currentUserUnitId = Template.instance().unitId.get()
            if(currentUserUnitId) {
                requisitionDoc.unitId = currentUserUnitId
            }

            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/createDraft', businessUnitId, requisitionDoc, null, function(err, res) {
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
    },
    'click #new-requisition-create': function(e, tmpl) {
        e.preventDefault()
        let description = $("input[name=description]").val()
        let dateRequired = $("input[name=dateRequired]").val()
        let requisitionReason = $("textarea[name=requisitionReason]").val()

        let validation = tmpl.areInputsValid(description, dateRequired, requisitionReason)
        if(validation === true) {
            let requisitionDoc = {}

            requisitionDoc.description = description
            requisitionDoc.dateRequired = new Date(dateRequired)
            requisitionDoc.requisitionReason = requisitionReason

            let currentUserUnitId = Template.instance().unitId.get()
            if(currentUserUnitId) {
                requisitionDoc.unitId = currentUserUnitId
            }
            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/create', businessUnitId, requisitionDoc, function(err, res) {
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
});

/*****************************************************************************/
/* ProcurementRequisitionCreate: Helpers */
/*****************************************************************************/
Template.ProcurementRequisitionCreate.helpers({
    'getCurrentUserUnitName': function() {
        let unitId = Template.instance().unitId.get()
        console.log(`Unit id: ${unitId}`)

        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    }
});

/*****************************************************************************/
/* ProcurementRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionCreate.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');
    console.log(`businessUnit: ${businessUnitId}`)

    self.unitId = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)

    self.autorun(function(){
        if(unitsSubscription.ready()){
            let employeeProfile = Meteor.user().employeeProfile
            if(employeeProfile) {
                let userPositionId = employeeProfile.employment.position
                let positionSubscription = self.subscribe('getEntity', userPositionId)
                if(positionSubscription.ready()){
                    let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
                    self.unitId.set(userPosition.parentId)
                }
            }
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

Template.ProcurementRequisitionCreate.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ProcurementRequisitionCreate.onDestroyed(function () {
});
