import _ from 'underscore';


/**
 *  Procurement Requisition Methods
 */
Meteor.methods({
    "ProcurementRequisition/createDraft": function(businessUnitId, procurementRequisitionDoc){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(businessUnitId, String);
        this.unblock()

        let userPositionId = Meteor.user().employeeProfile.employment.position
        console.log(`userPositionId: ${userPositionId}`)

        let userPosition = EntityObjects.findOne(_id: userPositionId, otype: 'Position')
        if(userPosition.properties) {
            let supervisorId = userPosition.properties.supervisor
            console.log(`SupervisorId: ${supervisorId}`)

            procurementRequisitionDoc.createdBy = Meteor.userId()
            procurementRequisitionDoc.status = 'Draft'
            procurementRequisitionDoc.businessUnitId = businessUnitId
            procurementRequisitionDoc.supervisorId = supervisorId

            ProcurementRequisitions.insert(procurementRequisitionDoc)
            return true
        }
        throw new Meteor.Error(404, "Sorry, you have not supervisor to approve your requisition");
    }
});
