import _ from 'underscore';


/**
 *  Procurement Requisition Methods
 */
Meteor.methods({
    "ProcurementRequisition/createDraft": function(businessUnitId, procurementRequisitionDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
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
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor
            console.log(`supervisorPositionId: ${supervisorPositionId}`)

            procurementRequisitionDoc.createdBy = Meteor.userId()
            procurementRequisitionDoc.status = 'Draft'
            procurementRequisitionDoc.businessUnitId = businessUnitId
            procurementRequisitionDoc.supervisorPositionId = supervisorPositionId
            if(docId) {
                ProcurementRequisitions.update(docId, {$set: procurementRequisitionDoc})
            } else{
                ProcurementRequisitions.insert(procurementRequisitionDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    },
    "ProcurementRequisition/create": function(businessUnitId, procurementRequisitionDoc, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
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
        if(userPosition.properties) {
            let supervisorPositionId = userPosition.properties.supervisor
            console.log(`supervisorPositionId: ${supervisorPositionId}`)

            procurementRequisitionDoc.createdBy = Meteor.userId()
            procurementRequisitionDoc.businessUnitId = businessUnitId
            procurementRequisitionDoc.supervisorPositionId = supervisorPositionId
            procurementRequisitionDoc.status = 'Pending'

            if(docId) {
                ProcurementRequisitions.update(docId, {$set: procurementRequisitionDoc})
            } else {
                ProcurementRequisitions.insert(procurementRequisitionDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    },
    "ProcurementRequisition/approve": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
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

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc.supervisorPositionId === userPositionId) {
            ProcurementRequisitions.update(docId, {$set: {status: 'Treated'}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized to approve requisition.")
        }
    },
    "ProcurementRequisition/reject": function(businessUnitId, docId){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
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

        let procurementRequisitionDoc = ProcurementRequisitions.findOne({_id: docId})
        if(procurementRequisitionDoc.supervisorPositionId === userPositionId) {
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
