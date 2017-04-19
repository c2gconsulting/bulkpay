import _ from 'underscore';


/**
 *  Procurement Requisition Methods
 */
Meteor.methods({
    "ProcurementRequisition/create": function(businessUnitId, procurementRequisitionDoc){
        if(!this.userId && Core.hasPayrollAccess(this.userId)){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(businessUnitId, String);
        this.unblock()

        //--
        ProcurementRequisitions.insert(procurementRequisitionDoc)
        return true;
    }
});
