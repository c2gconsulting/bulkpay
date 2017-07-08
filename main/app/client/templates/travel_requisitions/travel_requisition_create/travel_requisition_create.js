
/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionCreate.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('TravelRequisitionCreate')
    },
    "keyup input[name=flightCost]": _.throttle(function(e, tmpl) {
        var text = $(e.target).val().trim();

        if (!text || text.trim().length === 0) {
            text = "0"
        }
        let flightCostAsNumber = parseFloat(text)
        if(isNaN(flightCostAsNumber)) {
            flightCostAsNumber = 0
        }
        tmpl.flightCost.set(flightCostAsNumber)

        let accommodationCost = tmpl.accommodationCost.get()
        let localTransportCost = tmpl.localTransportCost.get()
        let perDiemCost = tmpl.perDiemCost.get()
        let miscCost = tmpl.miscCost.get()

        let totalTripCost = flightCostAsNumber + accommodationCost + localTransportCost + 
            perDiemCost + miscCost

        tmpl.totalTripCost.set(totalTripCost)
    }, 200),
    "keyup input[name=accommodationCost]": _.throttle(function(e, tmpl) {
        var text = $(e.target).val().trim();

        if (!text || text.trim().length === 0) {
            text = "0"
        }
        let accommodationCostAsNumber = parseFloat(text)
        if(isNaN(accommodationCostAsNumber)) {
            accommodationCostAsNumber = 0
        }
        tmpl.accommodationCost.set(accommodationCostAsNumber)

        let flightCost = tmpl.flightCost.get()
        let localTransportCost = tmpl.localTransportCost.get()
        let perDiemCost = tmpl.perDiemCost.get()
        let miscCost = tmpl.miscCost.get()

        let totalTripCost = flightCost + accommodationCostAsNumber + localTransportCost + 
            perDiemCost + miscCost

        tmpl.totalTripCost.set(totalTripCost)
    }, 200),
    "keyup input[name=localTransportCost]": _.throttle(function(e, tmpl) {
        var text = $(e.target).val().trim();

        if (!text || text.trim().length === 0) {
            text = "0"
        }
        let localTransportCostAsNumber = parseFloat(text)
        if(isNaN(localTransportCostAsNumber)) {
            localTransportCostAsNumber = 0
        }
        tmpl.localTransportCost.set(localTransportCostAsNumber)

        let flightCost = tmpl.flightCost.get()
        let accommodationCost = tmpl.accommodationCost.get()
        let perDiemCost = tmpl.perDiemCost.get()
        let miscCost = tmpl.miscCost.get()

        let totalTripCost = flightCost + accommodationCost + localTransportCostAsNumber + 
            perDiemCost + miscCost

        tmpl.totalTripCost.set(totalTripCost)
    }, 200),
    "keyup input[name=perDiemCost]": _.throttle(function(e, tmpl) {
        var text = $(e.target).val().trim();

        if (!text || text.trim().length === 0) {
            text = "0"
        }
        
        let perDiemCostAsNumber = parseFloat(text)
        if(isNaN(perDiemCostAsNumber)) {
            perDiemCostAsNumber = 0
        }
        tmpl.perDiemCost.set(perDiemCostAsNumber)

        let flightCost = tmpl.flightCost.get()
        let accommodationCost = tmpl.accommodationCost.get()
        let localTransportCost = tmpl.localTransportCost.get()
        let miscCost = tmpl.miscCost.get()

        let totalTripCost = flightCost + accommodationCost + localTransportCost + 
            perDiemCostAsNumber + miscCost

        tmpl.totalTripCost.set(totalTripCost)
    }, 200),
    "keyup input[name=miscCosts]": _.throttle(function(e, tmpl) {
        var text = $(e.target).val().trim();

        if (!text || text.trim().length === 0) {
            text = "0"
        }        
        let miscCostAsNumber = parseFloat(text)
        if(isNaN(miscCostAsNumber)) {
            miscCostAsNumber = 0
        }
        tmpl.miscCost.set(miscCostAsNumber)

        let flightCost = tmpl.flightCost.get()
        let accommodationCost = tmpl.accommodationCost.get()
        let localTransportCost = tmpl.localTransportCost.get()
        let perDiemCost = tmpl.perDiemCost.get()

        let totalTripCost = flightCost + accommodationCost + localTransportCost + 
            perDiemCost + miscCostAsNumber

        tmpl.totalTripCost.set(totalTripCost)
    }, 200),

    'click #new-requisition-save-draft': function(e, tmpl) {
        e.preventDefault()
        let description = $("input[name=description]").val()
        let dateRequired = $("input[name=dateRequired]").val()
        let requisitionReason = $("textarea[name=requisitionReason]").val()

        let flightCost = $("input[name=flightCost]").val()
        let accommodationCost = $("input[name=accommodationCost]").val()
        let localTransportCost = $("input[name=localTransportCost]").val()
        let perDiemCost = $("input[name=perDiemCost]").val()
        let miscCosts = $("input[name=miscCosts]").val()

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
            //--
            let flightCostAsNumber = parseFloat(flightCost)
            if(isNaN(flightCostAsNumber)) {
                flightCostAsNumber = 0
            }
            let accomodationCostAsNumber = parseFloat(accommodationCost)
            if(isNaN(accomodationCostAsNumber)) {
                accomodationCostAsNumber = 0
            }
            let localTransportCostAsNumber = parseFloat(localTransportCost)
            if(isNaN(localTransportCostAsNumber)) {
                localTransportCostAsNumber = 0
            }
            let perDiemCostAsNumber = parseFloat(perDiemCost)
            if(isNaN(perDiemCostAsNumber)) {
                perDiemCostAsNumber = 0
            }
            let miscCostAsNumber = parseFloat(miscCosts)
            if(isNaN(miscCostAsNumber)) {
                miscCostAsNumber = 0
            }
            requisitionDoc.tripCosts = {
                flightCost: flightCostAsNumber,
                accommodationCost: accomodationCostAsNumber,
                localTransportCost: localTransportCostAsNumber,
                perDiemCost: perDiemCostAsNumber,
                miscCosts: miscCostAsNumber
            }
            //--

            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/createDraft', businessUnitId, requisitionDoc, null, function(err, res) {
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

        let flightCost = $("input[name=flightCost]").val()
        let accommodationCost = $("input[name=accommodationCost]").val()
        let localTransportCost = $("input[name=localTransportCost]").val()
        let perDiemCost = $("input[name=perDiemCost]").val()
        let miscCosts = $("input[name=miscCosts]").val()

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
            //--
            let flightCostAsNumber = parseFloat(flightCost)
            if(isNaN(flightCostAsNumber)) {
                flightCostAsNumber = 0
            }
            let accomodationCostAsNumber = parseFloat(accommodationCost)
            if(isNaN(accomodationCostAsNumber)) {
                accomodationCostAsNumber = 0
            }
            let localTransportCostAsNumber = parseFloat(localTransportCost)
            if(isNaN(localTransportCostAsNumber)) {
                localTransportCostAsNumber = 0
            }
            let perDiemCostAsNumber = parseFloat(perDiemCost)
            if(isNaN(perDiemCostAsNumber)) {
                perDiemCostAsNumber = 0
            }
            let miscCostAsNumber = parseFloat(miscCosts)
            if(isNaN(miscCostAsNumber)) {
                miscCostAsNumber = 0
            }
            requisitionDoc.tripCosts = {
                flightCost: flightCostAsNumber,
                accommodationCost: accomodationCostAsNumber,
                localTransportCost: localTransportCostAsNumber,
                perDiemCost: perDiemCostAsNumber,
                miscCosts: miscCostAsNumber
            }
            //--
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/create', businessUnitId, requisitionDoc, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition is now pending treatment", type: "success",
                        confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                    }, () => {
                        Modal.hide()
                    })
                } else {
                    swal('Validation error', err.message, 'error')
                }
            })
        } else {
            swal('Validation error', validation, 'error')
        }
    }
});

/*****************************************************************************/
/* TravelRequisitionCreate: Helpers */
/*****************************************************************************/
Template.TravelRequisitionCreate.helpers({
    'getCurrentUserUnitName': function() {
        let unitId = Template.instance().unitId.get()
        console.log(`Unit id: ${unitId}`)

        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    },
    'totalTripCost': function() {
        return Template.instance().totalTripCost.get()
    }
});

/*****************************************************************************/
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionCreate.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');

    self.unitId = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)
    //--
    self.flightCost = new ReactiveVar(0)
    self.accommodationCost = new ReactiveVar(0)
    self.localTransportCost = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)
    self.perDiemCost = new ReactiveVar(0)
    self.miscCost = new ReactiveVar(0)

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

Template.TravelRequisitionCreate.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.TravelRequisitionCreate.onDestroyed(function () {
});
