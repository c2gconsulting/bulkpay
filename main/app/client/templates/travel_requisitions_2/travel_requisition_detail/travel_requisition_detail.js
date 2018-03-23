
/*****************************************************************************/
/* TravelRequisitionDetail: Event Handlers */
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

// 'click #new-requisition-create': function(e, tmpl) {
//     e.preventDefault()
//     let currentTravelRequest = tmpl.currentTravelRequest.curValue;
//      currentTravelRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

//     Meteor.call('TravelRequest2/create', currentTravelRequest, (err, res) => {
//         if (res){
//             swal({
//                 title: "Travel requisition created",
//                 text: "Your travel requisition has been created, a notification has been sent to your supervisor",
//                 confirmButtonClass: "btn-success",
//                 type: "success",
//                 confirmButtonText: "OK"
//             });
//         } else {
//             swal({
//                 title: "Oops!",
//                 text: "Your travel requisition could not be created, reason: " + err.message,
//                 confirmButtonClass: "btn-danger",
//                 type: "error",
//                 confirmButtonText: "OK"
//             });
//             console.log(err);
//         }
//     });

// },


Template.TravelRequisitionDetail.events({
    'click #requisition-save-draft': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        Meteor.call('TravelRequest/createDraft', currentTravelRequest, (err, res) => {
            if(!err) {
                swal({title: "Success", text: "Travel request Draft saved", type: "success",
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                }, () => {
                    Modal.hide()
                })
            } else {
                swal('Validation error', err.message, 'error')
            }
        })
       
    },
    'click #requisition-create': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        Meteor.call('TravelRequest/create',currentTravelRequest, (err, res) => {
            if(!err) {
                swal({title: "Success", text: "Travel request is now pending approval", type: "success",
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                }, () => {
                    Modal.hide()
                })
            } else {
                swal('Validation error', err.message, 'error')
            }
        })

        
      
    },
    'click #requisition-delete': (e,tmpl) => {
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        if(travelRequestDetails.status === 'Draft' || travelRequestDetails.status === 'Pending') {
            Meteor.call("TravelRequest/delete",currentTravelRequest, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Travel request deleted successfully!`, "success");
                } else {
                    swal("Error!", err.reason, "error");
                }
                // window.location.reload();
            });
        } else {
            swal("Error!", "You are not allowed to delete a travel request that is NOT in 'Draft' or 'Pending' state", "error");            
        }
    },
    'click #requisition-approver-edit': function(e, tmpl) {
        let isInEditMode = Template.instance().isInEditMode.get()
        let isInRetireMode = Template.instance().isInRetireMode.get()
        
        let isInApproveMode = Template.instance().isInApproveMode.get()

        if(isInApproveMode) {
            Template.instance().isInApproverEditMode.set(true)
        }
        // approverSave
    },
    'click #requisition-approver-save': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        Meteor.call('TravelRequest/approverSave', businessUnitId, requisitionDoc, currentTravelRequest._id, function(err, res) {
            tmpl.isInApproverEditMode.set(false)

            if(!err) {
                swal({title: "Success", text: "Requisition edits saved", type: "success",
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                }, () => {
                    
                })
            } else {
                swal('Validation error', err.reason, 'error')
            }
        })

        
      
    },
    'click #requisition-approve': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        Meteor.call('TravelRequest/approveWithApprovalRecommendation', 
        businessUnitId, currentTravelRequest._id, approvalRecommendation, function(err, res) {
        if(!err) {
            swal({title: "Success", text: "Travel request approved", type: "success",
                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
            }, () => {
                Modal.hide()
            })
        } else {
            swal('Validation error', err.message, 'error')
        }
    })
       
       
    },
    'click #requisition-treat': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        if(currentTravelRequest) {
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/treat',currentTravelRequest, (err, res) => {
                if(!err) { 
                    swal({title: "Success", text: "Travel request treated", type: "success",
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
    'click #requisition-retire': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        if(currentTravelRequest) {
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/retire', currentTravelRequest, (err, res) => {
                if(!err) {
                    swal({title: "Success", text: "Travel request retired", type: "success",
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
    'click #requisition-treatment-reject': function(e, tmpl) {
        e.preventDefault()
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        if(currentTravelRequest) {
            let businessUnitId = Session.get('context')

            Meteor.call('TravelRequest/treatmentRejected', currentTravelRequest, (err, res) => {
                if(!err) {
                    swal({title: "Success", text: "Travel request treatment rejected", type: "success",
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
        let currentTravelRequest = tmpl.currentTravelRequest.curValue;
        currentTravelRequest.businessUnitId = Session.get('context'); 
        Meteor.call('TravelRequest/reject', currentTravelRequest, (err, res) => {
            if(!err) {
                swal({title: "Success", text: "Travel request rejected", type: "success",
                    confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                }, () => {
                    Modal.hide()
                })
            } else {
                swal('Validation error', err.message, 'error')
            }
        })
        
    },
      
});


Template.registerHelper('formatDate', function(date) {
    return moment(date).format('DD-MM-YYYY');
});

/*****************************************************************************/
/* TravelRequisitionDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisitionDetail.helpers({
    'currentTravelRequest': function() {
        return Template.instance().currentTravelRequest.get()
    },
    getCreatedByFullName: (requisition) => {
        const userId = requisition.createdBy
        
        const user = Meteor.users.findOne(userId)
        return user ? user.profile.fullName : '...'
    },
    'isInEditMode': function() {
        return Template.instance().isInEditMode.get()
    },
    'isInApproveMode': function() {
        return Template.instance().isInApproveMode.get()
    },
    'isInApproverEditMode': function() {
        return Template.instance().isInApproverEditMode.get()
    },
    'isInTreatMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'isInRetireMode': function() {
        return Template.instance().isInTreatMode.get()
    },
    'getUnitName': function(unitId) {
        if(unitId) {
            console.log(`unit id: `, unitId)
            return EntityObjects.findOne({_id: unitId}).name            
        }
    },
  
    'getHumanReadableApprovalState': function(boolean) {
        return boolean ? "Approved" : "Rejected"
    },
    'or': (a, b) => {
        return a || b
    },
    'isEqual': (a, b) => {
        return a === b;
    },
   
  
    'totalTripCostNGN': function() {
        return Template.instance().totalTripCostNGN.get()
    },
});

/*****************************************************************************/
/* TravelRequisitionDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.currentTravelRequest = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()
    self.isInRetireMode = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

    let invokeReason = self.data;

    // self.totalTripCost = new ReactiveVar(0)
    self.amountNonPaybelToEmp = new ReactiveVar(0)
    self.amoutPayableToEmp = new ReactiveVar(0)
    self.totalTripCost = new ReactiveVar(0)

    if(invokeReason.reason === 'edit') {
        self.isInEditMode.set(true)
    }
    if(invokeReason.reason === 'approve') {
        self.isInApproveMode.set(true)
    }
    if(invokeReason.reason === 'treat') {
        self.isInTreatMode.set(true)
    }
    if(invokeReason.reason === 'retire') {
        self.isInRetireMode.set(true)
    }

    self.businessUnitLogoUrl = new ReactiveVar()

    self.autorun(function() {
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, customConfig) {
            if(!err) {
                self.businessUnitCustomConfig.set(customConfig)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let procurementSub = self.subscribe('TravelRequest', invokeReason.requisitionId)

        if(procurementSub.ready()) {
            let travelRequestDetails = TravelRequisitions.findOne({_id: invokeReason.requisitionId})
            self.currentTravelRequest.set(travelRequestDetails)
            //--
            self.updateTotalTripCost();
            //--
            if(travelRequestDetails.unitId) {
                self.subscribe('getEntity', travelRequestDetails.unitId)
            }
        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })

   
});

Template.TravelRequisitionDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let currentTravelRequest = self.currentTravelRequest.get()
    if(currentTravelRequest) {
        if(currentTravelRequest.status !== 'Draft' && currentTravelRequest.status !== 'Pending') {
            if(self.isInEditMode.get()) {
                Modal.hide();
                swal('Error', "Sorry, you can't edit this travel request. ", 'error')
            }
        } else if(currentTravelRequest.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(currentTravelRequest.status === 'Approve') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this travel request. It has been approved", 'error')
            }
        }
    }
});

Template.TravelRequisitionDetail.onDestroyed(function () {
});
