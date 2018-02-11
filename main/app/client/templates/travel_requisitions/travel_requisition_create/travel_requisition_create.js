
/*****************************************************************************/
/* TravelRequisitionCreate: Event Handlers */
/*****************************************************************************/
import _ from 'underscore';

Template.TravelRequisitionCreate.events({
    'click #createProcurementRequisition': function(e, tmpl) {
        e.preventDefault()

        Modal.show('TravelRequisitionCreate')
    },
    "change .fieldInputField": _.throttle(function(e, tmpl) {
        const fieldName = $(e.target).attr('name');
        var inputVal = $(e.target).val().trim();        
        const customConfig = tmpl.businessUnitCustomConfig.get();

        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;    
            if(travelRequestConfig) {
                let fields = travelRequestConfig.fields || [];
                console.log(`inputVal: `, inputVal)

                fields.forEach(field => {
                    if(field.dbFieldName === fieldName) {
                        if(!tmpl[fieldName]) {
                            tmpl[fieldName] = new ReactiveVar();
                        }

                        if(field.type === 'String' || field.type === 'TextArea') {
                            tmpl[fieldName].set(inputVal)
                        } else if(field.type === 'Date' || field.type === 'Time') {
                            if(inputVal && inputVal.length > 0) {
                                const date = new Date(inputVal)
                                const momentObj = moment(date)

                                if(momentObj.isBefore(moment())) {
                                    if(!field.allowDatesInPast) {
                                        tmpl[fieldName].set(null)
                                        $(e.target).val(null)
                                    } else {
                                        if(inputVal && inputVal.length > 0)
                                            tmpl[fieldName].set(new Date(inputVal))
                                        else
                                            tmpl[fieldName].set(null)
                                    }
                                } else {
                                    if(inputVal && inputVal.length > 0)
                                        tmpl[fieldName].set(new Date(inputVal))
                                    else
                                        tmpl[fieldName].set(null)
                                }
                            } else {
                                tmpl[fieldName].set(null)
                                $(e.target).val(null)
                            }
                        }
                    }
                })
            }
        }   
    }, 200),
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
        let requisitionDoc = {}

        let currentUserUnitId = Template.instance().unitId.get()
        if(currentUserUnitId) {
            requisitionDoc.unitId = currentUserUnitId
        }
        //--
        const customConfig = tmpl.businessUnitCustomConfig.get();
        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;    
            if(travelRequestConfig) {
                let fields = travelRequestConfig.fields || [];
                fields.forEach(field => {
                    if(tmpl[field.dbFieldName]) {
                        const fieldVal = tmpl[field.dbFieldName].get();
                        requisitionDoc[field.dbFieldName] = fieldVal;    
                    }
                })

                requisitionDoc.tripCosts = {}
                let costs = travelRequestConfig.costs || [];
                costs.forEach(cost => {
                    const costAmount = tmpl[cost.dbFieldName].get();
                    requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
                })
            }
        }
        //--
        let businessUnitId = Session.get('context')

        Meteor.call('TravelRequest/createDraft', businessUnitId, requisitionDoc, null, function(err, res) {
            if(!err) {
                swal({title: "Success", text: "Requisition Draft saved", type: "success",
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                }, () => {
                    // Modal.hide()
                })
            } else {
                swal('Validation error', err.message, 'error')
            }
        })
    },
    'click #new-requisition-create': function(e, tmpl) {
        e.preventDefault()

        let validation = tmpl.areInputsValid(tmpl)
        if(validation === true) {
            let requisitionDoc = {}

            let currentUserUnitId = Template.instance().unitId.get()
            if(currentUserUnitId) {
                requisitionDoc.unitId = currentUserUnitId
            }
            //--
            const customConfig = tmpl.businessUnitCustomConfig.get();
            if(customConfig) {
                let travelRequestConfig = customConfig.travelRequestConfig;    
                if(travelRequestConfig) {
                    let fields = travelRequestConfig.fields || [];
                    fields.forEach(field => {
                        if(tmpl[field.dbFieldName]) {
                            const fieldVal = tmpl[field.dbFieldName].get();
                            requisitionDoc[field.dbFieldName] = fieldVal;    
                        }
                    })
                    //--
                    requisitionDoc.tripCosts = {}
                    let costs = travelRequestConfig.costs || [];
                    costs.forEach(cost => {
                        const costAmount = tmpl[cost.dbFieldName].get();
                        requisitionDoc.tripCosts[cost.dbFieldName] = costAmount;
                    })
                }
            }
            //--
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/create', businessUnitId, requisitionDoc, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition is now pending approval", type: "success",
                        confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                    }, () => {
                        //Modal.hide()
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
    'amountNonPaybelToEmp': function() {
        return Template.instance().amountNonPaybelToEmp.get()
    },
    'amoutPayableToEmp': function() {
        return Template.instance().amoutPayableToEmp.get()
    },
    'totalTripCost': function() {
        return Template.instance().totalTripCost.get()
    },
    'isEqual': (a, b) => {
        return a === b;
    },
    'fields': function() {
        let customConfig = Template.instance().businessUnitCustomConfig.get()
        if(customConfig) {
            const travelRequestConfig = customConfig.travelRequestConfig;
            return travelRequestConfig.fields
        }
    },
    'costs': function() {
        let customConfig = Template.instance().businessUnitCustomConfig.get()
        if(customConfig) {
            const travelRequestConfig = customConfig.travelRequestConfig;
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
    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
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

    self.areInputsValid = function(tmpl) {
        const customConfig = tmpl.businessUnitCustomConfig.get();
        let isOk = false;

        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;    
            if(travelRequestConfig) {
                let fields = travelRequestConfig.fields || [];

                fields.forEach(field => {
                    if(field.isRequired) {
                        if(tmpl[field.dbFieldName]) {
                            const fieldVal = tmpl[field.dbFieldName].get();
                            if(!fieldVal) {
                                isOk = `Please fill ${field.label}`
                            }
                        } else {
                            isOk = `Please fill ${field.label}`
                        }
                    }
                })
            }
        }
        if(isOk) {
            return isOk
        } else {
            return true
        }
    }

    self.updateTotalTripCost = () => {
        const customConfig = self.businessUnitCustomConfig.get();
        if(customConfig) {
            let travelRequestConfig = customConfig.travelRequestConfig;

            if(travelRequestConfig) {
                let costs = travelRequestConfig.costs || [];
                let nonPayableToEmp = 0;
                let payableToEmp = 0;
                let totalCosts = 0;
                
                costs.forEach(cost => {
                    const costAmount = self[cost.dbFieldName].get();
                    totalCosts += costAmount;

                    if(cost.isPayableToStaff) {
                        payableToEmp += costAmount;
                    } else if(!cost.isPayableToStaff) {
                        nonPayableToEmp += costAmount;
                    }
                })
                self.amountNonPaybelToEmp.set(nonPayableToEmp)
                self.amoutPayableToEmp.set(payableToEmp)
                self.totalTripCost.set(totalCosts)
            }
        } else {
            self.amountNonPaybelToEmp.set(0)
            self.amoutPayableToEmp.set(0)
            self.totalTripCost.set(0)
        }
    }
});

Template.TravelRequisitionCreate.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.TravelRequisitionCreate.onDestroyed(function () {
});
