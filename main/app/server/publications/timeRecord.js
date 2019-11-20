/**
 * Travel Request publications
 */


 Core.publish("TimeRecordsBySupervisor", function (businessUnitId, supervisorId) {
     return TimeRecord.find({businessId: businessUnitId, supervisorId: supervisorId});
 });

 Core.publish("TimeRecordsByBudgetHolder", function (businessUnitId, budgetHolderId) {
     return TimeRecord.find({businessId: businessUnitId, budgetHolderId: budgetHolderId});
 });

 Core.publish("TimeRecordsByFinanceApprover", function (businessUnitId, financeApproverId) {
     return TimeRecord.find({businessId: businessUnitId, financeApproverId: financeApproverId});
 });

Core.publish("TimeRecordsICreated", function (businessUnitId) {
    let user = this.userId;

    return TimeRecord.find({businessId: businessUnitId, createdBy: this.userId});
});

Core.publish("TimeRecordsAdminCreated", function (businessUnitId) {


    return TimeRecord.find({businessId: businessUnitId});
});

Core.publish("TimeRecordsStatusNotSeen", function (businessUnitId) {
    let user = this.userId;
    return TimeRecord.find({
        businessId: businessUnitId,
        createdBy: this.userId,
        isStatusSeenByCreator: false
    });
});

Meteor.publish("TimeRecord2", function (requisitionId) {
    return TimeRecord.find({_id: requisitionId});
});
Core.publish("TimeRecordToRetire", function (requisitionId) {
    return TimeRecord.find({_id: requisitionId});
});

Core.publish("TimeRecordsToApprove", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }
    let userPositionId = user.employeeProfile.employment.position

    return TimeRecord.find({
        businessId: businessUnitId,
        $or: [{supervisorPositionId : userPositionId},
                {alternativeSupervisorPositionId: userPositionId}]
    });
});


Core.publish("TimeRecordsToTreat", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }

    let userPositionId = user.employeeProfile.employment.position

    if (Core.hasTravelRequisitionApproveAccess(this.userId)) {
        return TimeRecord.find({
            businessId: businessUnitId,
            status: 'Approved'
        });
    } else {
        return Meteor.Error(401, "Unauthorized! You don't have the 'Travel Requisition Approve' role");
    }
});
