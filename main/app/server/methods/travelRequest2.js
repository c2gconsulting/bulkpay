import _ from 'underscore';



let TravelRequestHelper = {
    sendRequisitionCreated: function(supervisorFullName, supervisorEmail, createdByFullName,
        currentTravelRequest, approvalsPageUrl) {
        try {
            SSR.compileTemplate("travelRequestNotification", Assets.getText("emailTemplates/travelRequestNotification.html"));
            Email.send({
                to: supervisorEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request created!",
                html: SSR.render("travelRequestNotification", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    currentTravelRequest,

                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    sendRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName,
        currentTravelRequest, approvalsPageUrl) {
        try {
            SSR.compileTemplate("travelRequisitionNotificationForTreatment", Assets.getText("emailTemplates/travelRequisitionNotificationForTreatment.html"));

            Email.send({
                to: supervisorEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
                subject: "Travel Request approved and needs to be treated",
                html: SSR.render("travelRequisitionNotificationForTreatment", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    currentTravelRequest,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    }
}

/**
 *  Travel Request Methods
 */
Meteor.methods({
    "TravelRequest2/createDraft": function(currentTravelRequest){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        // travelRequestDoc.createdBy = Meteor.userId()
        // travelRequestDoc.status = 'Draft'
        // travelRequestDoc.businessId = businessUnitId
        // if(docId) {
        //     TravelRequisitions.update(docId, {$set: travelRequestDoc})
        // } else{
        //     TravelRequisitions.insert(travelRequestDoc)
        // }

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to create a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.status = 'Draft'
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else{
                TravelRequisitions.insert(travelRequestDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have no supervisor to approve your requisition");
    },
    "TravelRequest2/retire": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        // travelRequestDoc.createdBy = Meteor.userId()
        // travelRequestDoc.status = 'Draft'
        // travelRequestDoc.businessId = businessUnitId
        // if(docId) {
        //     TravelRequisitions.update(docId, {$set: travelRequestDoc})
        // } else{
        //     TravelRequisitions.insert(travelRequestDoc)
        // }

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to create a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor

            travelRequestDoc.createdBy = Meteor.userId()
            travelRequestDoc.status = 'Retire'
            travelRequestDoc.businessId = businessUnitId
            travelRequestDoc.supervisorPositionId = supervisorPositionId
            if(docId) {
                TravelRequisitions.update(docId, {$set: travelRequestDoc})
            } else{
                TravelRequisitions.insert(travelRequestDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have no supervisor to approve your requisition");
    },
    "TravelRequest2/create": function(currentTravelRequest){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        console.log(currentTravelRequest.businessUnitId);
        check(currentTravelRequest.businessUnitId, String);
        this.unblock()



        currentTravelRequest.supervisorId = (Meteor.users.findOne(currentTravelRequest.createdBy)).directSupervisorId;
        console.log("user isss:")
        console.log(Meteor.users.findOne(currentTravelRequest.createdBy))
        currentTravelRequest.budgetHolderId = (Budgets.findOne(currentTravelRequest.budgetCodeId))._id;

        console.log("current travel request is: ");
        console.log(currentTravelRequest);

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        TravelRequisition2s.insert(currentTravelRequest);
        return true;
    },
    "TravelRequest2/approverSave": function(businessUnitId, travelRequestDoc, docId){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy);
        if(createdBy) {
            let userPositionId = createdBy.employeeProfile.employment.position
            let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})

            if(userPosition.properties.supervisor === this.userId || userPosition.properties.alternateSupervisor === this.userId) {
                if(docId) {
                    TravelRequisitions.update(docId, {$set: travelRequestDoc})
                }
                return true
            } else {
                throw new Meteor.Error(404, "Sorry, you are not allowed to edit a travel request you are not a supervisor for.");
            }
        }

        throw new Meteor.Error(404, "Sorry, the creator of the travel request could not be found");
    },
    "TravelRequest2/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }

        let doc = TravelRequisitions.findOne({_id: id});
        if(!doc) {
        }
        if(doc.createdBy !== this.userId) {
            throw new Meteor.Error(401, "Unauthorized. You cannot delete a travel request you did not create.");
        }
        if(doc.status === "Draft" || doc.status === "Pending"){
            TravelRequisitions.remove({_id: id});
            return true;
        } else {
            throw new Meteor.Error(401, "You cannot delete a travel request that has already been approved or rejected.");
        }
    },
    "TravelRequest2/approve": function(businessUnitId, docId) {
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(!travelRequestDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")
        }

        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(travelRequestDoc.alternativeSupervisorPositionId === userPositionId) {
                let approvals = travelRequestDoc.approvals || []
                approvals.push({
                    approverUserId: Meteor.userId(),
                    firstApprover: false,
                    secondApprover: true,
                    approvalStatus: true
                })
                let approvalSetObject = {
                    status: 'Approved',
                    approvedByUserId: Meteor.userId(),
                    approvals: approvals
                }
                TravelRequisitions.update(docId, {$set: approvalSetObject})

                //--
                let usersWithTravelTreatRole = Meteor.users.find({
                    businessIds: businessUnitId,
                    'roles.__global_roles__': Core.Permissions.TRAVEL_REQUISITION_TREAT
                }).fetch()

                try {
                    let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy)
                    let createdByEmail = createdBy.emails[0].address;
                    let createdByFullName = createdBy.profile.fullName
                    let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
                    let unitName = unit.name
                    let dateRequired = ''
                    if(travelRequestDoc.dateRequired) {
                        dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
                    }
                    let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/treatlist`
                    //--
                    if(usersWithTravelTreatRole && usersWithTravelTreatRole.length > 0) {
                        _.each(usersWithTravelTreatRole, function(travelRequestTreater) {
                            let supervisorEmail =  travelRequestTreater.emails[0].address;

                            TravelRequestHelper.sendRequisitionNeedsTreatment(
                                travelRequestTreater.profile.fullName,
                                supervisorEmail, createdByFullName,
                                travelRequestDoc.description,
                                unitName,
                                dateRequired,
                                travelRequestDoc.requisitionReason,
                                approvalsPageUrl)
                        })
                        // let supervisorEmail =  usersWithTravelTreatRole[0].emails[0].address;

                        // TravelRequestHelper.sendRequisitionNeedsTreatment(
                        //     usersWithTravelTreatRole[0].profile.fullName,
                        //     supervisorEmail, createdByFullName,
                        //     travelRequestDoc.description,
                        //     unitName,
                        //     dateRequired,
                        //     travelRequestDoc.requisitionReason,
                        //     approvalsPageUrl)
                    }
                } catch(errorInSendingEmail) {
                    console.log(errorInSendingEmail)
                }
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            if(travelRequestDoc.supervisorPositionId === userPositionId) {
                TravelRequisitions.update(docId, {$set: {status: 'Approved'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to approve requisition.")
            }
        }
    },
    "TravelRequest2/approveWithApprovalRecommendation": function(businessUnitId, docId,
            approvalRecommendation) {
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to approve a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(!travelRequestDoc) {
            throw new Meteor.Error(401, "Travel request does not exist.")
        }

        let approvalStatus = 'PartiallyApproved'

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let createdByUser = Meteor.users.findOne(travelRequestDoc.createdBy)
        if(createdByUser) {
            let createdByUserPositionId = createdByUser.employeeProfile.employment.position
            let createdByUserPosition = EntityObjects.findOne({_id: createdByUserPositionId, otype: 'Position'})
            if(createdByUserPosition.properties
                && (createdByUserPosition.properties.supervisor || createdByUserPosition.properties.alternateSupervisor)) {
                let supervisorPositionId = createdByUserPosition.properties.supervisor || ""
                let alternateSupervisorPositionId = createdByUserPosition.properties.alternateSupervisor || ""

                let supervisors = []
                let alternateSupervisors = []

                if(supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': supervisorPositionId
                    }).fetch()
                }

                if(alternateSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': alternateSupervisorPositionId
                    }).fetch()

                    if(alternateSupervisors.length === 0) {
                        approvalStatus = 'Approved'
                    }
                } else {
                    approvalStatus = 'Approved'
                }
            }
        } else {
            throw new Meteor.Error(401, "The user who created the travel request could not be found.")
        }

        if(travelRequestDoc.supervisorPositionId === userPositionId) {
            let approvals = travelRequestDoc.approvals || []
            approvals.push({
                approverUserId: Meteor.userId(),
                firstApprover: true,
                secondApprover: false,
                approvalStatus: true,
                approvalRecommendation: approvalRecommendation
            })
            let approvalSetObject = {
                status: approvalStatus,
                approvals: approvals
            }
            TravelRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy)
                let createdByEmail = createdBy.emails[0].address;
                let createdByFullName = createdBy.profile.fullName
                let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
                let unitName = unit.name
                let dateRequired = ''
                if(travelRequestDoc.dateRequired) {
                    dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
                }
                let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/approvalslist`

                let alternateSupervisors = []

                if(travelRequestDoc.alternativeSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': travelRequestDoc.alternativeSupervisorPositionId
                    }).fetch()
                }
                //--
                if(alternateSupervisors && alternateSupervisors.length > 0) {
                    let supervisorEmail =  alternateSupervisors[0].emails[0].address;

                    TravelRequestHelper.sendRequisitionCreated(
                        alternateSupervisors[0].profile.fullName,
                        supervisorEmail, createdByFullName,
                        travelRequestDoc.description,
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                } else {
                    if(approvalStatus === 'Approved') {
                        let usersWithTravelTreatRole = Meteor.users.find({
                            businessIds: businessUnitId,
                            'roles.__global_roles__': Core.Permissions.TRAVEL_REQUISITION_TREAT
                        }).fetch()

                        try {
                            let createdBy = Meteor.users.findOne(travelRequestDoc.createdBy)
                            let createdByEmail = createdBy.emails[0].address;
                            let createdByFullName = createdBy.profile.fullName
                            let unit = EntityObjects.findOne({_id: travelRequestDoc.unitId, otype: 'Unit'})
                            let unitName = unit.name
                            let dateRequired = ''
                            if(travelRequestDoc.dateRequired) {
                                dateRequired = moment(travelRequestDoc.dateRequired).format('DD/MM/YYYY')
                            }
                            let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/travelrequests/treatlist`
                            //--
                            if(usersWithTravelTreatRole && usersWithTravelTreatRole.length > 0) {
                                _.each(usersWithTravelTreatRole, function(travelRequestTreater) {
                                    let supervisorEmail =  travelRequestTreater.emails[0].address;

                                    TravelRequestHelper.sendRequisitionNeedsTreatment(
                                        travelRequestTreater.profile.fullName,
                                        supervisorEmail, createdByFullName,
                                        travelRequestDoc.description,
                                        unitName,
                                        dateRequired,
                                        travelRequestDoc.requisitionReason,
                                        approvalsPageUrl)
                                })
                            }
                        } catch(errorInSendingEmail) {
                            console.log(errorInSendingEmail)
                        }
                    }
                }
            } catch(errorInSendingEmail) {
                console.log(errorInSendingEmail)
            }
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition with recommendation.")
        }
    },
    "TravelRequest2/treat": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to treat a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc) {
            TravelRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        }
    },
    "TravelRequest2/treatmentRejected": function(businessUnitId, docId) {
        if(!this.userId && !Core.hasProcurementRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to reject a travel request because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc) {
            TravelRequisitions.update(docId, {$set: {status: 'TreatmentRejected'}})
            return true;
        }
    },
    "TravelRequest2/reject": function(businessUnitId, docId) {
        // if(!this.userId && !Core.hasTravelRequisitionApproveAccess(this.userId)){
        //     throw new Meteor.Error(401, "Unauthorized");
        // }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to reject a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})

        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(travelRequestDoc.alternativeSupervisorPositionId === userPositionId) {
                ProcurementRequisitions.update(docId, {$set: {status: 'Rejected'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            if(travelRequestDoc.supervisorPositionId === userPositionId) {
                TravelRequisitions.update(docId, {$set: {status: 'Rejected'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to approve requisition.")
            }
        }
    },
    "TravelRequest2/rejectWithApprovalRecommendation": function(businessUnitId, docId, approvalRecommendation){
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to reject a travel requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(!travelRequestDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")
        }

        let approvalStatus = 'PartiallyRejected'

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let createdByUser = Meteor.users.findOne(travelRequestDoc.createdBy)
        if(createdByUser) {
            let createdByUserPositionId = createdByUser.employeeProfile.employment.position
            let createdByUserPosition = EntityObjects.findOne({_id: createdByUserPositionId, otype: 'Position'})
            if(createdByUserPosition.properties
                && (createdByUserPosition.properties.supervisor || createdByUserPosition.properties.alternateSupervisor)) {
                let supervisorPositionId = createdByUserPosition.properties.supervisor || ""
                let alternateSupervisorPositionId = createdByUserPosition.properties.alternateSupervisor || ""

                let supervisors = []
                let alternateSupervisors = []

                if(supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': supervisorPositionId
                    }).fetch()
                }

                if(alternateSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': alternateSupervisorPositionId
                    }).fetch()

                    if(alternateSupervisors.length === 0) {
                        approvalStatus = 'Rejected'
                    }
                } else {
                    approvalStatus = 'Rejected'
                }
            }
        } else {
            throw new Meteor.Error(401, "The user who created the travel request could not be found.")
        }

        if(travelRequestDoc.supervisorPositionId === userPositionId) {
            let approvals = travelRequestDoc.approvals || []
            approvals.push({
                approverUserId: Meteor.userId(),
                firstApprover: true,
                secondApprover: false,
                approvalStatus: false,
                approvalRecommendation: approvalRecommendation
            })
            let approvalSetObject = {
                status: approvalStatus,
                approvals: approvals
            }
            TravelRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let supervisors = []
                let alternateSupervisors = []

                if(travelRequestDoc.supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': travelRequestDoc.supervisorPositionId
                    }).fetch()
                }

                if(travelRequestDoc.alternateSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': travelRequestDoc.alternativeSupervisorPositionId
                    }).fetch()
                }
                //--
                if(alternateSupervisors && alternateSupervisors.length > 0) {
                    let supervisorEmail =  alternateSupervisors[0].emails[0].address;

                    TravelRequestHelper.sendRequisitionCreated(
                        alternateSupervisors[0].profile.fullName,
                        supervisorEmail, createdByFullName,
                        travelRequestDoc.description,
                        unitName,
                        dateRequired,
                        travelRequestDoc.requisitionReason,
                        approvalsPageUrl)
                }
            } catch(errorInSendingEmail) {
                console.log(errorInSendingEmail)
            }
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to reject requisition with recommendation.")
        }
    },
    "TravelRequest2/markAsSeen": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let travelRequestDoc = TravelRequisitions.findOne({_id: docId})
        if(travelRequestDoc.createdBy === Meteor.userId()) {
            TravelRequisitions.update(docId, {$set: {isStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that requisition")
        }
    }
});
