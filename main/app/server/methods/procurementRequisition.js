import _ from 'underscore';


let ProcurementRequisitonHelper = {
    sendRequisitionCreated: function(supervisorFullName, supervisorEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        try {
            SSR.compileTemplate("procurementRequisitionNotification", Assets.getText("emailTemplates/procurementRequisitionNotification.html"));
            
            Email.send({
                to: supervisorEmail,
                from: "Hub825Travel™ Team <eariaroo@c2gconsulting.com>",
                subject: "Procurement Requisition created!",
                html: SSR.render("procurementRequisitionNotification", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    description: description,
                    unit: unitName,
                    dateRequired: dateRequired,
                    reason: requisitionReason,
                    approvalsPageUrl: approvalsPageUrl
                })
            });
            return true
        } catch(e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    sendRequisitionNeedsTreatment: function(supervisorFullName, supervisorEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        // console.log(`arguments: `, arguments)
        try {
            SSR.compileTemplate("procurementRequisitionNotificationForTreatment", Assets.getText("emailTemplates/procurementRequisitionNotificationForTreatment.html"));
            
            Email.send({
                to: supervisorEmail,
                from: "Hub825Travel™ Team <eariaroo@c2gconsulting.com>",
                subject: "Procurement Requisition approved and needs to be treated",
                html: SSR.render("procurementRequisitionNotificationForTreatment", {
                    user: supervisorFullName,
                    createdBy: createdByFullName,
                    description: description,
                    unit: unitName,
                    dateRequired: dateRequired,
                    reason: requisitionReason,
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
 *  Procurement Requisition Methods
 */
Meteor.methods({
    "ProcurementRequisition/createDraft": function(businessUnitId, procurementRequisitionDoc, docId){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties 
            && (userPosition.properties.supervisor || userPosition.properties.alternateSupervisor)) {
            let supervisorPositionId = userPosition.properties.supervisor || ""
            let alternateSupervisorPositionId = userPosition.properties.alternateSupervisor || ""

            procurementRequisitionDoc.createdBy = Meteor.userId()
            procurementRequisitionDoc.status = 'Draft'
            procurementRequisitionDoc.businessUnitId = businessUnitId
            procurementRequisitionDoc.supervisorPositionId = supervisorPositionId
            procurementRequisitionDoc.alternativeSupervisorPositionId = alternateSupervisorPositionId
            
            if(docId) {
                ProcurementRequisitions.update(docId, {$set: procurementRequisitionDoc})
            } else{
                ProcurementRequisitions.insert(procurementRequisitionDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have no supervisor to approve your requisition");
    },
    "ProcurementRequisition/create": function(businessUnitId, procurementRequisitionDoc, docId){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to create a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties 
            && (userPosition.properties.supervisor || userPosition.properties.alternateSupervisor)) {
            let supervisorPositionId = userPosition.properties.supervisor || ""
            let alternateSupervisorPositionId = userPosition.properties.alternateSupervisor || ""

            procurementRequisitionDoc.createdBy = Meteor.userId()
            procurementRequisitionDoc.businessUnitId = businessUnitId
            procurementRequisitionDoc.supervisorPositionId = supervisorPositionId
            procurementRequisitionDoc.alternativeSupervisorPositionId = alternateSupervisorPositionId
            procurementRequisitionDoc.status = 'Pending'

            if(docId) {
                ProcurementRequisitions.update(docId, {$set: procurementRequisitionDoc})
            } else {
                docId = ProcurementRequisitions.insert(procurementRequisitionDoc)
            }            
            //--
            let createdBy = Meteor.users.findOne(Meteor.userId())
            
            let createdByEmail = createdBy.emails[0].address;
            let createdByFullName = createdBy.profile.fullName

            const procDoc = ProcurementRequisitions.findOne({_id: docId})
            let unit = EntityObjects.findOne({_id: procDoc.unitId, otype: 'Unit'})
            let unitName = unit.name

            let dateRequired = ''
            if(procurementRequisitionDoc.dateRequired) {
                dateRequired = moment(procurementRequisitionDoc.dateRequired).format('DD/MM/YYYY')
            }
            let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/procurementrequisitions/approvalslist`
            //--
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
            }
            let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
            if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
                if(supervisors && supervisors.length > 0) {
                    let supervisorEmail =  supervisors[0].emails[0].address;

                    ProcurementRequisitonHelper.sendRequisitionCreated(
                        supervisors[0].profile.fullName,
                        supervisorEmail, createdByFullName, 
                        procurementRequisitionDoc.description, 
                        unitName,
                        dateRequired,
                        procurementRequisitionDoc.requisitionReason,
                        approvalsPageUrl)
                }
            } else {
                if(supervisors && supervisors.length > 0) {
                    supervisors.forEach(aSupervisor => {
                        let supervisorEmail =  aSupervisor.emails[0].address;

                        ProcurementRequisitonHelper.sendRequisitionCreated(
                            aSupervisor.profile.fullName,
                            supervisorEmail, createdByFullName, 
                            procurementRequisitionDoc.description, 
                            unitName,
                            dateRequired,
                            procurementRequisitionDoc.requisitionReason,
                            approvalsPageUrl)
                    })
                }
                if(alternateSupervisors && alternateSupervisors.length > 0) {
                    alternateSupervisors.forEach(aSupervisor => {
                        let supervisorEmail =  aSupervisor.emails[0].address;

                        ProcurementRequisitonHelper.sendRequisitionCreated(
                            aSupervisor.profile.fullName,
                            supervisorEmail, createdByFullName, 
                            procurementRequisitionDoc.description, 
                            unitName,
                            dateRequired,
                            procurementRequisitionDoc.requisitionReason,
                            approvalsPageUrl)
                    })
                }
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have no supervisor to approve your requisition");
    },
    "ProcurementRequisition/approverSave": function(businessUnitId, procurementRequisitionDoc, docId){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let createdBy = Meteor.users.findOne(procurementRequisitionDoc.createdBy);
        if(createdBy) {
            let userPositionId = createdBy.employeeProfile.employment.position
            let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
            
            if(userPosition.properties.supervisor === this.userId || userPosition.properties.alternateSupervisor === this.userId) {
                if(docId) {
                    ProcurementRequisitions.update(docId, {$set: procurementRequisitionDoc})
                }
                return true
            } else {
                throw new Meteor.Error(404, "Sorry, you are not allowed to edit a procurement you are not a supervisor for.");            
            }
        }

        throw new Meteor.Error(404, "Sorry, the creator of the requisition could not be found");
    },
    "ProcurementRequisition/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        
        let doc = ProcurementRequisitions.findOne({_id: id});
        if(!doc) {
        }
        if(doc.createdBy !== this.userId) {
            throw new Meteor.Error(401, "Unauthorized. You cannot delete a procurement you did not create.");
        }
        if(doc.status === "Draft" || doc.status === "Pending"){
            ProcurementRequisitions.remove({_id: id});
            return true;
        } else {
            throw new Meteor.Error(401, "You cannot delete a procurement that has already been approved or rejected.");            
        }
    },
    "ProcurementRequisition/approve": function(businessUnitId, docId){
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})

        if(!procurementRequisitionDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")            
        }

        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
                let approvals = procurementRequisitionDoc.approvals || []
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
                ProcurementRequisitions.update(docId, {$set: approvalSetObject})
                //--
                let usersWithProcurementTreatRole = Meteor.users.find({
                    businessIds: businessUnitId,
                    'roles.__global_roles__': Core.Permissions.PROCUREMENT_REQUISITION_TREAT
                }).fetch()
                // console.log(`usersWithProcurementApproveRole: `, usersWithProcurementApproveRole)

                try {
                    let createdBy = Meteor.users.findOne(procurementRequisitionDoc.createdBy)                
                    let createdByEmail = createdBy.emails[0].address;
                    let createdByFullName = createdBy.profile.fullName
                    let unit = EntityObjects.findOne({_id: procurementRequisitionDoc.unitId, otype: 'Unit'})
                    let unitName = unit.name
                    let dateRequired = ''
                    if(procurementRequisitionDoc.dateRequired) {
                        dateRequired = moment(procurementRequisitionDoc.dateRequired).format('DD/MM/YYYY')
                    }
                    let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/procurementrequisitions/treatlist`
                    //--
                    if(usersWithProcurementTreatRole && usersWithProcurementTreatRole.length > 0) {
                        _.each(usersWithProcurementTreatRole, function(procurementTreater) {
                            let supervisorEmail =  procurementTreater.emails[0].address;
                            
                            ProcurementRequisitonHelper.sendRequisitionNeedsTreatment(
                                procurementTreater.profile.fullName,
                                supervisorEmail, createdByFullName, 
                                procurementRequisitionDoc.description, 
                                unitName,
                                dateRequired,
                                procurementRequisitionDoc.requisitionReason,
                                approvalsPageUrl)
                        })
                    }
                } catch(errorInSendingEmail) {
                    console.log(errorInSendingEmail)
                }
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            if(procurementRequisitionDoc.supervisorPositionId === userPositionId 
                || procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
                ProcurementRequisitions.update(docId, {$set: {status: 'Approved'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to approve requisition.")
            }
        }
    },
    "ProcurementRequisition/approveWithApprovalRecommendation": function(businessUnitId, docId, 
            approvalRecommendation) {
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you are not allowed to approve a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})

        if(!procurementRequisitionDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")
        }
        let approvalStatus = 'PartiallyApproved'

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let createdByUser = Meteor.users.findOne(procurementRequisitionDoc.createdBy)
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
            throw new Meteor.Error(401, "The user who created the procurement could not be found.")
        }

        //--

        if(procurementRequisitionDoc.supervisorPositionId === userPositionId) {
            let approvals = procurementRequisitionDoc.approvals || []
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
            ProcurementRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let createdBy = Meteor.users.findOne(procurementRequisitionDoc.createdBy)                
                let createdByEmail = createdBy.emails[0].address;
                let createdByFullName = createdBy.profile.fullName
                let unit = EntityObjects.findOne({_id: procurementRequisitionDoc.unitId, otype: 'Unit'})
                let unitName = unit.name
                let dateRequired = ''
                if(procurementRequisitionDoc.dateRequired) {
                    dateRequired = moment(procurementRequisitionDoc.dateRequired).format('DD/MM/YYYY')
                }
                let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/procurementrequisitions/approvalslist`

                let alternateSupervisors = []

                if(procurementRequisitionDoc.alternativeSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': procurementRequisitionDoc.alternativeSupervisorPositionId
                    }).fetch()
                }
                //--
                if(alternateSupervisors && alternateSupervisors.length > 0) {
                    let supervisorEmail =  alternateSupervisors[0].emails[0].address;

                    ProcurementRequisitonHelper.sendRequisitionCreated(
                        alternateSupervisors[0].profile.fullName,
                        supervisorEmail, createdByFullName, 
                        procurementRequisitionDoc.description, 
                        unitName,
                        dateRequired,
                        procurementRequisitionDoc.requisitionReason,
                        approvalsPageUrl)
                } else {
                    if(approvalStatus === 'Approved') {
                        let usersWithProcurementTreatRole = Meteor.users.find({
                            businessIds: businessUnitId,
                            'roles.__global_roles__': Core.Permissions.PROCUREMENT_REQUISITION_TREAT
                        }).fetch()
        
                        try {
                            let createdBy = Meteor.users.findOne(procurementRequisitionDoc.createdBy)                
                            let createdByEmail = createdBy.emails[0].address;
                            let createdByFullName = createdBy.profile.fullName
                            let unit = EntityObjects.findOne({_id: procurementRequisitionDoc.unitId, otype: 'Unit'})
                            let unitName = unit.name
                            let dateRequired = ''
                            if(procurementRequisitionDoc.dateRequired) {
                                dateRequired = moment(procurementRequisitionDoc.dateRequired).format('DD/MM/YYYY')
                            }
                            let approvalsPageUrl = Meteor.absoluteUrl() + `business/${businessUnitId}/employee/procurementrequisitions/treatlist`
                            //--
                            if(usersWithProcurementTreatRole && usersWithProcurementTreatRole.length > 0) {
                                _.each(usersWithProcurementTreatRole, function(procurementTreater) {
                                    let supervisorEmail =  procurementTreater.emails[0].address;
                                    
                                    ProcurementRequisitonHelper.sendRequisitionNeedsTreatment(
                                        procurementTreater.profile.fullName,
                                        supervisorEmail, createdByFullName, 
                                        procurementRequisitionDoc.description, 
                                        unitName,
                                        dateRequired,
                                        procurementRequisitionDoc.requisitionReason,
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
    "ProcurementRequisition/treat": function(businessUnitId, docId){
        if(!this.userId && !Core.hasProcurementRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc) {
            ProcurementRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        }
    },
    "ProcurementRequisition/treatmentRejected": function(businessUnitId, docId){
        if(!this.userId && !Core.hasProcurementRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to approve a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc) {
            ProcurementRequisitions.update(docId, {$set: {status: 'TreatmentRejected'}})
            return true;
        }
    },
    "ProcurementRequisition/reject": function(businessUnitId, docId){
        if(!this.userId && !Core.hasProcurementRequisitionApproveAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to reject a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position
        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
    
        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
                ProcurementRequisitions.update(docId, {$set: {status: 'Rejected'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            if(procurementRequisitionDoc.supervisorPositionId === userPositionId
                || procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
                ProcurementRequisitions.update(docId, {$set: {status: 'Rejected'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to reject requisition.")
            }
        }
    },
    "ProcurementRequisition/rejectWithApprovalRecommendation": function(businessUnitId, docId, approvalRecommendation){
        check(businessUnitId, String);
        this.unblock()

        if(!Meteor.user().employeeProfile || !Meteor.user().employeeProfile.employment) {
            let errMsg = "Sorry, you have not allowed to reject a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(!procurementRequisitionDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")            
        }

        let approvalStatus = 'PartiallyRejected'

        let userPositionId = Meteor.user().employeeProfile.employment.position

        let createdByUser = Meteor.users.findOne(procurementRequisitionDoc.createdBy)
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
            throw new Meteor.Error(401, "The user who created the procurement could not be found.")
        }

        if(procurementRequisitionDoc.supervisorPositionId === userPositionId) {
            let approvals = procurementRequisitionDoc.approvals || []
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
            ProcurementRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let supervisors = []
                let alternateSupervisors = []

                if(procurementRequisitionDoc.supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': procurementRequisitionDoc.supervisorPositionId
                    }).fetch()
                }

                if(procurementRequisitionDoc.alternateSupervisorPositionId) {
                    alternateSupervisors = Meteor.users.find({
                        'employeeProfile.employment.position': procurementRequisitionDoc.alternativeSupervisorPositionId
                    }).fetch()
                }
                //--
                if(alternateSupervisors && alternateSupervisors.length > 0) {
                    let supervisorEmail =  alternateSupervisors[0].emails[0].address;

                    ProcurementRequisitonHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        supervisorEmail, createdByFullName, 
                        procurementRequisitionDoc.description, 
                        unitName,
                        dateRequired,
                        procurementRequisitionDoc.requisitionReason,
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
    "ProcurementRequisition/markAsSeen": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(businessUnitId, String);
        this.unblock()

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc.createdBy === Meteor.userId()) {
            ProcurementRequisitions.update(docId, {$set: {isStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that requisition")
        }
    }
});
