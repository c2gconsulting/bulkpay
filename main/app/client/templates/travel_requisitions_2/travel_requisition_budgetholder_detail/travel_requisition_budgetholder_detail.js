
/*****************************************************************************/
/* TravelRequisitionBudgetHolderDetail: Event Handlers */
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
//                 text: "Your travel requisition has been created, a notification has been sent to your budgetHolder",
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


Template.TravelRequisitionBudgetHolderDetail.events({
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
'click #approve': (e, tmpl) => {

    let budgetHolderComment = $('[name=budgetHolderComment]').val();

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.budgetHolderComment = budgetHolderComment;
    currentTravelRequest.status = "Approved By Budget Holder";

    currentTravelRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe

    Meteor.call('TravelRequest2/budgetHolderApprovals', currentTravelRequest, (err, res) => {
        if (res){
            swal({
                title: "Travel requisition has been approved",
                text: "Employee travel requisition has been approved,notification has been sent to the necessary parties",
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
        } else {
            swal({
                title: "Oops!",
                text: "Travel requisition has  not been updated, reason: " + err.message,
                confirmButtonClass: "btn-danger",
                type: "error",
                confirmButtonText: "OK"
            });
            console.log(err);
        }
    });
},

'click #reject': (e, tmpl) => {

    let budgetHolderComment = $('[name=budgetHolderComment]').val();

    let currentTravelRequest = tmpl.currentTravelRequest.curValue;
    currentTravelRequest.budgetHolderComment = budgetHolderComment;
    currentTravelRequest.status = "Rejected By Budget Holder";
    currentTravelRequest.businessUnitId = Session.get('context'); //set the business unit id one more time to be safe
    Meteor.call('TravelRequest2/create', currentTravelRequest, (err, res) => {
        if (res){
            swal({
                title: "Travel requisition has been rejected",
                text: "Employee travel requisition has been rejected,notification has been sent to the necessary parties",
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
        } else {
            swal({
                title: "Oops!",
                text: "Travel requisition has  not been updated, reason: " + err.message,
                confirmButtonClass: "btn-danger",
                type: "error",
                confirmButtonText: "OK"
            });
            console.log(err);
        }
    });






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
/* TravelRequisitionBudgetHolderDetail: Helpers */
/*****************************************************************************/
Template.TravelRequisitionBudgetHolderDetail.helpers({
    travelTypeChecked(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.type === val ? checked="checked" : '';
        }
    },
    isReturnTrip(){
        return Template.instance().currentTravelRequest.get().type === "Return";
    },
    isCarModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "CAR"? '':'none';
        }
    },
    isAirModeOfTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();

        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].transportationMode === "AIRLINE"? '':'none';
        }
    },
    isBreakfastIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isBreakfastIncluded? checked="checked" : '';
        }
    },
    provideAirportPickup(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideAirportPickup? checked="checked" : '';
        }
    },
    provideGroundTransport(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].provideGroundTransport? checked="checked" : '';
        }
    },
    isLunchIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isLunchIncluded? checked="checked" : '';
        }
    },
    isDinnerIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isDinnerIncluded? checked="checked" : '';
        }
    },
    isIncidentalsIncluded(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index){
            return currentTravelRequest.trips[parseInt(index) - 1].isIncidentalsIncluded? checked="checked" : '';
        }
    },
    isLastLeg(index){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && index && currentTravelRequest.type ==="Multiple"){
            return parseInt(index) >= currentTravelRequest.trips.length;
        }
    },
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})

        if(travelcity) {
            return travelcity.name
        }
    },
    budgetList() {
        return  Budgets.find();
    },
    budgetCodeSelected(val){
        const currentTravelRequest = Template.instance().currentTravelRequest.get();
        if(currentTravelRequest && val){
            return currentTravelRequest.budgetCodeId === val ? selected="selected" : '';
        }
    },

    'getHotelName': function(hotelId) {
        const hotel = Hotels.findOne({_id: hotelId})

        if(hotel) {
            return hotel.name
        }
    },
    'getAirlineName': function(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})

        if(airline) {
            return airline.name
        }
    },
    'getBudgetName': function(budgetCodeId) {
        const budget = Budgets.findOne({_id: budgetCodeId})

        if(budget) {
            return budget.name
        }
    },
    'currentTravelRequest': function() {
        return Template.instance().currentTravelRequest.get()
    },
    'getEmployeeNameById': function(employeeId){
        return (Meteor.users.findOne({_id: employeeId})).profile.fullName;
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
/* TravelRequisitionBudgetHolderDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelRequisitionBudgetHolderDetail.onCreated(function () {


    let self = this;
    let businessUnitId = Session.get('context');
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    self.subscribe("budgets", Session.get('context'));




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
        let travelRequest2Sub = self.subscribe('TravelRequest2', invokeReason.requisitionId)


        if(travelRequest2Sub.ready()) {

            let travelRequestDetails = TravelRequisition2s.findOne({_id: invokeReason.requisitionId})
            self.currentTravelRequest.set(travelRequestDetails)


        }

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitLogoUrl.set(businessUnit.logoUrl)
        }
    })


});

Template.TravelRequisitionBudgetHolderDetail.onRendered(function () {
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

Template.TravelRequisitionBudgetHolderDetail.onDestroyed(function () {
});
