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
                ProcurementRequisitions.update(docId, procurementRequisitionDoc)
            } else{
                ProcurementRequisitions.insert(procurementRequisitionDoc)
            }
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    },
    "ProcurementRequisition/create": function(businessUnitId, procurementRequisitionDoc){
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

            ProcurementRequisitions.insert(procurementRequisitionDoc)
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    }
});
