import _ from 'underscore';



let ProcurementRequisitonHelper = {
    sendRequisitionCreated: function(supervisorFullName, supervisorEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        try {
            SSR.compileTemplate("procurementRequisitionNotification", Assets.getText("emailTemplates/procurementRequisitionNotification.html"));
            
            Email.send({
                to: supervisorEmail,
                from: "BulkPay™ Team <eariaroo@c2gconsulting.com>",
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
                ProcurementRequisitions.insert(procurementRequisitionDoc)
            }
            //--
            let createdBy = Meteor.users.findOne(Meteor.userId())
            
            let createdByEmail = createdBy.emails[0].address;
            let createdByFullName = createdBy.profile.fullName
            let unit = EntityObjects.findOne({_id: procurementRequisitionDoc.unitId, otype: 'Unit'})
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
                        aSupervisor.profile.fullName,
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
                ProcurementRequisitions.update(docId, {$set: {status: 'Approved'}})
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
            let errMsg = "Sorry, you have not allowed to approve a procurement requisition because you are a super admin"
            throw new Meteor.Error(401, errMsg);
        }
        let userPositionId = Meteor.user().employeeProfile.employment.position

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})

        if(!procurementRequisitionDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")            
        }

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
                status: 'PartiallyApproved',
                approvals: approvals
            }
            ProcurementRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let supervisors = []
                let alternateSupervisors = []

                if(supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': procurementRequisitionDoc.supervisorPositionId
                    }).fetch()
                }

                if(alternateSupervisorPositionId) {
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
        
        let businessCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: businessUnitId})
        if(businessCustomConfig && businessCustomConfig.isTwoStepApprovalEnabled) {
            if(procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
                ProcurementRequisitions.update(docId, {$set: {status: 'Rejected'}})
                return true;
            } else {
                throw new Meteor.Error(401, "Unauthorized to perform final approval")
            }
        } else {
            let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
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
        if(!procurementRequisitionDoc) {
            throw new Meteor.Error(401, "Requisition does not exist.")            
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
                status: 'PartiallyRejected',
                approvals: approvals
            }
            ProcurementRequisitions.update(docId, {$set: approvalSetObject})
            //--
            try {
                let supervisors = []
                let alternateSupervisors = []

                if(supervisorPositionId) {
                    supervisors = Meteor.users.find({
                        'employeeProfile.employment.position': procurementRequisitionDoc.supervisorPositionId
                    }).fetch()
                }

                if(alternateSupervisorPositionId) {
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
