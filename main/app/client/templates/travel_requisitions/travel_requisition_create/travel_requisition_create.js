
/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionCreate.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('TravelRequisitionCreate')
    },
    "keyup .costInputField": _.throttle(function(e, tmpl) {
        const fieldName = $(e.target).attr('name');        
        var text = $(e.target).val().trim();
        
        if (!text || text.trim().length === 0) {
            text = "0"
        }
        let costAsNumber = parseFloat(text)
        if(isNaN(costAsNumber)) {
            costAsNumber = 0
        }
        tmpl[fieldName].set(costAsNumber)
        tmpl.updateTotalTripCost()        
    }, 200),

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
            //--
            requisitionDoc.tripCosts = {}
            
            const customConfig = tmpl.businessUnitCustomConfig.get();
            if(customConfig) {
                let travelRequestConfig = customConfig.travelRequestConfig;    
                if(travelRequestConfig) {
                    let costs = travelRequestConfig.costs || [];
                    costs.forEach(cost => {
                        const costAmount = tmpl[cost.dbFieldName].get();
                        requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
                    })
                }
            }
            console.log(`requisitionDoc: `, requisitionDoc)
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
            requisitionDoc.tripCosts = {}

            const customConfig = tmpl.businessUnitCustomConfig.get();
            if(customConfig) {
                let travelRequestConfig = customConfig.travelRequestConfig;    
                if(travelRequestConfig) {
                    let costs = travelRequestConfig.costs || [];
                    costs.forEach(cost => {
                        const costAmount = tmpl[cost.dbFieldName].get();
                        requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
                    })
                }
            }
            console.log(`requisitionDoc: `, requisitionDoc)
            //--
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/create', businessUnitId, requisitionDoc, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition is now pending approval", type: "success",
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
        if(unitId) {
            let unit = EntityObjects.findOne({_id: unitId});
            if(unit) {
                return unit.name
            }
        }
    },
    'totalTripCost': function() {
        return Template.instance().totalTripCost.get()
    },
    'costs': function() {
        let customConfig = Template.instance().businessUnitCustomConfig.get()
        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;
            console.log(`travelRequestConfig: `, travelRequestConfig)

            return travelRequestConfig.costs
        }
    }
});

/*****************************************************************************/
/* TravelRequisitionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionCreate.onCreated(function () {
    let self = this;

    let businessUnitId = Session.get('context');

    self.unitId = new ReactiveVar()
    self.businessUnitCustomConfig = new ReactiveVar()

    let unitsSubscription = self.subscribe('getCostElement', businessUnitId)
    let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());
    //--
    // self.flightCost = new ReactiveVar(0)
    // self.accommodationCost = new ReactiveVar(0)
    // self.localTransportCost = new ReactiveVar(0)
    // self.perDiemCost = new ReactiveVar(0)
    // self.miscCost = new ReactiveVar(0)
    // self.roadCost = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    self.getUnitForPosition = (entity) => {
        let possibleUnitId = entity.parentId
        if(possibleUnitId) {
            let possibleUnit = EntityObjects.findOne({_id: possibleUnitId})
            if(possibleUnit) {
                if(possibleUnit.otype === 'Unit') {
                    return possibleUnit
                } else {
                    return self.getUnitForPosition(possibleUnit)
                }
            } else {
                return null
            }
        } else {
            return null
        }
    }

    self.autorun(function(){
        if(unitsSubscription.ready()){
            let employeeProfile = Meteor.user().employeeProfile
            if(employeeProfile && employeeProfile.employment && employeeProfile.employment.position) {
                let userPositionId = employeeProfile.employment.position
                let positionSubscription = self.subscribe('getEntity', userPositionId)

                if(positionSubscription.ready()){
                    let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
                    let unit = self.getUnitForPosition(userPosition)
                    if(unit) {
                        self.unitId.set(unit._id)
                    } else {
                        self.unitId.set(null)                        
                    }
                }
            }
        }

        if(customConfigSub.ready()) {
            const customConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            self.businessUnitCustomConfig.set(customConfig)            
            if(customConfig) {
                let travelRequestConfig = customConfig.travelRequestConfig;
                if(travelRequestConfig) {
                    let costs = travelRequestConfig.costs || [];
                    costs.forEach(cost => {
                        self[cost.dbFieldName] = new ReactiveVar(0)
                    })
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

    self.updateTotalTripCost = () => {
        const customConfig = self.businessUnitCustomConfig.get();
        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;

            if(travelRequestConfig) {
                let costs = travelRequestConfig.costs || [];
                let totalCosts = 0;
                costs.forEach(cost => {
                    const costAmount = self[cost.dbFieldName].get();
                    totalCosts += costAmount;
                })
                self.totalTripCost.set(totalCosts)
            }
        } else {
            self.totalTripCost.set(0)
        }
    }
});

Template.TravelRequisitionCreate.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.TravelRequisitionCreate.onDestroyed(function () {
});
