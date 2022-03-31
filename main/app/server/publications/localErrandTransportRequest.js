/**
 * Travel Request publications
 */


Core.publish("LocalErrandTransportRequestsBySupervisor", function (businessUnitId, supervisorId) {
    return LocalErrandTransportRequisitions.find({businessId: businessUnitId, supervisorId: supervisorId});
});

Core.publish("LocalErrandTransportRequestsByBudgetHolder", function (businessUnitId, budgetHolderId) {
    return LocalErrandTransportRequisitions.find({businessId: businessUnitId, budgetHolderId: budgetHolderId});
});

Core.publish("LocalErrandTransportRequestsByFinanceApprover", function (businessUnitId, financeApproverId) {
    return LocalErrandTransportRequisitions.find({businessId: businessUnitId, financeApproverId: financeApproverId});
});

Core.publish("LocalErrandTransportRequestsICreated", function (businessUnitId) {
   let user = this.userId;

   return LocalErrandTransportRequisitions.find({businessId: businessUnitId, createdBy: this.userId});
});

Core.publish("LocalErrandTransportRequestsAdminCreated", function (businessUnitId) {


   const currentLocalErrandTransportRequest = LocalErrandTransportRequisitions.find({businessId: businessUnitId})
   console.log('current local errand transport request', currentLocalErrandTransportRequest);
   return currentLocalErrandTransportRequest;
   // .map((currentLocalErrandTransportRequest) => {
   //     currentLocalErrandTransportRequest.supervisor = Meteor.users.findOne(currentLocalErrandTransportRequest.supervisorId);
   //     currentLocalErrandTransportRequest.budgetHolder = Meteor.users.findOne(currentLocalErrandTransportRequest.budgetHolderId);
   //     return currentLocalErrandTransportRequest;
   // });
});

Core.publish("LocalErrandTransportRequestsStatusNotSeen", function (businessUnitId) {
   let user = this.userId;
   return LocalErrandTransportRequisitions.find({
       businessId: businessUnitId,
       createdBy: this.userId,
       isStatusSeenByCreator: false
   });
});

Meteor.publish("LocalErrandTransportRequest", function (requisitionId) {
   return LocalErrandTransportRequisitions.find({_id: requisitionId});
});
Core.publish("LocalErrandTransportRequestToRetire", function (requisitionId) {
   return LocalErrandTransportRequisitions.find({_id: requisitionId});
});

Core.publish("LocalErrandTransportRequestsToApprove", function (businessUnitId) {
   let user = Meteor.users.findOne({_id: this.userId})

   if(!user.employeeProfile || !user.employeeProfile.employment) {
       return Meteor.Error(401, "Unauthorized! You can't approve a local errand transport request");
   }
   let userPositionId = user.employeeProfile.employment.position

   return LocalErrandTransportRequisitions.find({
       businessId: businessUnitId,
       $or: [{supervisorPositionId : userPositionId},
               {alternativeSupervisorPositionId: userPositionId}]
   });
});


Core.publish("LocalErrandTransportRequestsToTreat", function (businessUnitId) {
   let user = Meteor.users.findOne({_id: this.userId})

   if(!user.employeeProfile || !user.employeeProfile.employment) {
       return Meteor.Error(401, "Unauthorized! You can't approve a local errand transport request");
   }

   let userPositionId = user.employeeProfile.employment.position

   if (Core.hasTravelRequisitionApproveAccess(this.userId)) {
       return LocalErrandTransportRequisitions.find({
           businessId: businessUnitId,
           status: 'Approved'
       });
   } else {
       return Meteor.Error(401, "Unauthorized! You don't have the 'Travel Requisition Approve' role");
   }
});
