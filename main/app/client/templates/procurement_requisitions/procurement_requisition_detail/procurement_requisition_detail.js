
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
                        swal({title: "Success", text: "Requisition is now pending approval", type: "success",
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
    'click #requisition-delete': (e,tmpl) => {
        let procurementDetails = tmpl.procurementDetails.get()
        if(procurementDetails.status === 'Draft' || procurementDetails.status === 'Pending') {
            Meteor.call("ProcurementRequisition/delete", procurementDetails._id, function(err,res){
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Procurement deleted successfully!`, "success");
                } else {
                    swal("Error!", err.reason, "error");
                }
                // window.location.reload();
            });
        } else {
            swal("Error!", "You are not allowed to delete a procurement that is NOT in 'Draft' or 'Pending' state", "error");            
        }
    },
    'click #requisition-approver-edit': function(e, tmpl) {
        let isInEditMode = Template.instance().isInEditMode.get()
        let isInApproveMode = Template.instance().isInApproveMode.get()

        if(isInApproveMode) {
            Template.instance().isInApproverEditMode.set(true)
        }
        // approverSave
    },
    'click #requisition-approver-save': function(e, tmpl) {
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

                Meteor.call('ProcurementRequisition/approverSave', businessUnitId, requisitionDoc, procurementDetails._id, function(err, res) {
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

            let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
            if(businessUnitCustomConfig && businessUnitCustomConfig.isTwoStepApprovalEnabled) {
                if(Template.instance().isFirstSupervisor()) {
                    let approvalRecommendation = $("textarea[name=approvalRecommendation]").val()
                    
                    Meteor.call('ProcurementRequisition/approveWithApprovalRecommendation', 
                        businessUnitId, procurementDetails._id, approvalRecommendation, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Requisition approved and sent for final approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else if(Template.instance().isSecondSupervisor()) {
                    Meteor.call('ProcurementRequisition/approve', businessUnitId, procurementDetails._id, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Requisition approved and sent for treatment approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else {

                }
            } else {
                Meteor.call('ProcurementRequisition/approve', businessUnitId, procurementDetails._id, function(err, res) {
                    if(!err) {
                        swal({title: "Success", text: "Requisition approved", type: "success",
                            confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                        }, () => {
                            Modal.hide()
                        })
                    } else {
                        swal('Validation error', err.message, 'error')
                    }
                })
            }
        }
    },
    'click #requisition-treat': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/treat', businessUnitId, procurementDetails._id, function(err, res) {
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
    'click #requisition-treatment-reject': function(e, tmpl) {
        e.preventDefault()
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let businessUnitId = Session.get('context')

            Meteor.call('ProcurementRequisition/treatmentRejected', businessUnitId, procurementDetails._id, function(err, res) {
                if(!err) {
                    swal({title: "Success", text: "Requisition treatment rejected", type: "success",
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

            let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
            if(businessUnitCustomConfig && businessUnitCustomConfig.isTwoStepApprovalEnabled) {
                if(Template.instance().isFirstSupervisor()) {
                    let approvalRecommendation = $("textarea[name=approvalRecommendation]").val()
                    
                    Meteor.call('ProcurementRequisition/rejectWithApprovalRecommendation', 
                        businessUnitId, procurementDetails._id, approvalRecommendation, function(err, res) {
                        if(!err) {
                            swal({title: "Success", text: "Requisition rejected and sent for final approval", type: "success",
                                confirmButtonColor: "#DD6B55", confirmButtonText: "OK!", closeOnConfirm: true
                            }, () => {
                                Modal.hide()
                            })
                        } else {
                            swal('Validation error', err.message, 'error')
                        }
                    })
                } else if(Template.instance().isSecondSupervisor()) {
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
                } else {

                }
            } else {
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
        }
    },
    'click #requisition-print': function(e, tmpl) {
        // $("#ProcurementRequisitionDetailModal").printThis({
        //     importStyle: true
        // });
        let businessUnitLogoUrl = Template.instance().businessUnitLogoUrl.get()

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
        // .html(`Procurement Requisition: ${employeeFullName}`)
        .html(`Procurement Requisition`)        
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
    'getUnitName': function(unitId) {
        if(unitId)
            return EntityObjects.findOne({_id: unitId}).name
    },
    'isTwoStepApprovalEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTwoStepApprovalEnabled
        }
    },
    'isFirstSupervisor': function() {
        return Template.instance().isFirstSupervisor()
     },
    'isSecondSupervisor': function() {
        return Template.instance().isSecondSupervisor()
    },
    'firstSupervisorApproval': function() {
        let procurement = Template.instance().procurementDetails.get()

        let procurementApprovals = procurement.approvals || []
        let firstApproval = {}
        procurementApprovals.forEach(anApproval => {
            if(anApproval.firstApprover) {
                firstApproval = anApproval
            }
        })

        if(firstApproval) {
            let approverUserId = firstApproval.approverUserId
            if(approverUserId) {
                let approverUser = Meteor.users.findOne(approverUserId)
                if(approverUser) {
                    firstApproval.approverFullName = approverUser.profile.fullName
                }
            }
        }
        return firstApproval
    },
    'getHumanReadableApprovalState': function(boolean) {
        return boolean ? "Approved" : "Rejected"
    },
    'or': (a, b) => {
        return a || b
    }
});

/*****************************************************************************/
/* ProcurementRequisitionDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.ProcurementRequisitionDetail.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context')

    self.procurementDetails = new ReactiveVar()
    self.isInEditMode = new ReactiveVar()
    self.isInViewMode = new ReactiveVar()
    self.isInApproveMode = new ReactiveVar()
    self.isInApproverEditMode = new ReactiveVar()
    self.isInTreatMode = new ReactiveVar()

    self.businessUnitCustomConfig = new ReactiveVar()

    let invokeReason = self.data;
    if(invokeReason.reason === 'edit') {
        self.isInEditMode.set(true)
    }
    if(invokeReason.reason === 'approve') {
        self.isInApproveMode.set(true)
    }
    if(invokeReason.reason === 'treat') {
        self.isInTreatMode.set(true)
    }

    self.businessUnitLogoUrl = new ReactiveVar()

    self.autorun(function() {
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                self.businessUnitCustomConfig.set(res)
            }
        })

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        let procurementSub = self.subscribe('ProcurementRequisition', invokeReason.requisitionId)

        self.subscribe('getCostElement', businessUnitId)

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

    self.isFirstSupervisor = () => {
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let currentUser = Meteor.user()
            let currentUserPositionId = null

            if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                currentUserPositionId = currentUser.employeeProfile.employment.position
            }

            let creatorUserId = procurementDetails.createdBy;

            let user = Meteor.users.findOne({_id: creatorUserId})
            if(user && user.employeeProfile && user.employeeProfile.employment) {
                let userPositionId = user.employeeProfile.employment.position
                let userPosition = EntityObjects.findOne({_id: userPositionId})

                if(userPosition) {
                    return userPosition.properties.supervisor === currentUserPositionId
                }
            }
        }
    }

    self.isSecondSupervisor = () => {
        let procurementDetails = Template.instance().procurementDetails.get()
        if(procurementDetails) {
            let currentUser = Meteor.user()
            let currentUserPositionId = null

            if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                currentUserPositionId = currentUser.employeeProfile.employment.position
            }

            let creatorUserId = procurementDetails.createdBy;

            let user = Meteor.users.findOne({_id: creatorUserId})
            if(user && user.employeeProfile && user.employeeProfile.employment) {
                let userPositionId = user.employeeProfile.employment.position

                let userPosition = EntityObjects.findOne({_id: userPositionId})
                if(userPosition) {
                    return userPosition.properties.alternateSupervisor === currentUserPositionId
                }
            }
        }
    }
});

Template.ProcurementRequisitionDetail.onRendered(function () {
    $('select.dropdown').dropdown();
    let self = this

    let procurementDetails = self.procurementDetails.get()
    if(procurementDetails) {
        if(procurementDetails.status !== 'Draft') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this procurement requisition. ", 'error')
            }
        } else if(procurementDetails.status === 'Pending') {
            self.isInViewMode.set(true)
        } else if(procurementDetails.status === 'Approved') {
            if(self.isInEditMode.get()) {
                swal('Error', "Sorry, you can't edit this procurement requisition. It has been approved", 'error')
            }
        }
    }
});

Template.ProcurementRequisitionDetail.onDestroyed(function () {
});
