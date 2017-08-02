import _ from 'underscore';



let ProcurementRequisitonHelper = {
    sendRequisitionCreated: function(supervisorFullName, createdByEmail, createdByFullName, 
        description, unitName, dateRequired, requisitionReason, approvalsPageUrl) {
        try {
            SSR.compileTemplate("procurementRequisitionNotification", Assets.getText("emailTemplates/procurementRequisitionNotification.html"));
            Email.send({
                to: "efeariaroo@gmail.com",
                from: "BulkPay<bulkpay@c2gconsulting.com>",
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
        console.log(`userPositionId: ${userPositionId}`)

        let userPosition = EntityObjects.findOne({_id: userPositionId, otype: 'Position'})
        if(userPosition.properties 
            && (userPosition.properties.supervisor || userPosition.properties.alternateSupervisor)) {
            let supervisorPositionId = userPosition.properties.supervisor || ""
            let alternateSupervisorPositionId = userPosition.properties.alternateSupervisor || ""
            console.log(`supervisorPositionId: ${supervisorPositionId}`)

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
            if(supervisors && supervisors.length > 0) {
                supervisors.forEach(aSupervisor => {
                    ProcurementRequisitonHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        createdByEmail, createdByFullName, 
                        procurementRequisitionDoc.description, 
                        unitName,
                        dateRequired,
                        procurementRequisitionDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }
            if(alternateSupervisors && alternateSupervisors.length > 0) {
                alternateSupervisors.forEach(aSupervisor => {
                    ProcurementRequisitonHelper.sendRequisitionCreated(
                        aSupervisor.profile.fullName,
                        createdByEmail, createdByFullName, 
                        procurementRequisitionDoc.description, 
                        unitName,
                        dateRequired,
                        procurementRequisitionDoc.requisitionReason,
                        approvalsPageUrl)
                })
            }            
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have no supervisor to approve your requisition");
    },
    "ProcurementRequisition/approve": function(businessUnitId, docId){
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
        console.log(`userPositionId: ${userPositionId}`)

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc.supervisorPositionId === userPositionId 
            || procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
            ProcurementRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
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
        console.log(`userPositionId: ${userPositionId}`)

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc.supervisorPositionId === userPositionId
            || procurementRequisitionDoc.alternativeSupervisorPositionId === userPositionId) {
            ProcurementRequisitions.update(docId, {$set: {status: 'Rejected'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
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
