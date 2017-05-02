/**
 * Procurement Requisition publications
 */

Core.publish("ProcurementRequisitionsICreated", function (businessUnitId) {
    let user = this.userId;

    return ProcurementRequisitions.find({businessUnitId: businessUnitId, createdBy: this.userId});
});

Core.publish("ProcurementRequisitionsStatusNotSeen", function (businessUnitId) {
    let user = this.userId;
    return ProcurementRequisitions.find({
        businessUnitId: businessUnitId,
        createdBy: this.userId,
        isStatusSeenByCreator: false
    });
});

Core.publish("ProcurementRequisition", function (requisitionId) {
    return ProcurementRequisitions.find({_id: requisitionId});
});


Core.publish("ProcurementRequisitionsToApprove", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a procurement requisition");
    }

    let userPositionId = user.employeeProfile.employment.position

    if (Core.hasProcurementRequisitionApproveAccess(this.userId)) {
        return ProcurementRequisitions.find({
            businessUnitId: businessUnitId,
            supervisorPositionId: userPositionId
        });
    } else {
        return Meteor.Error(401, "Unauthorized! You don't have the 'Procurement Requisition Approve' role");
    }
});
