/**
 * Travel Request publications
 */

Core.publish("TravelRequestsICreated1", function (businessUnitId) {
    let user = this.userId;

    return TravelRequisitions.find({businessId: businessUnitId, createdBy: this.userId});
});

Core.publish("TravelRequestsStatusNotSeen1", function (businessUnitId) {
    let user = this.userId;
    return TravelRequisitions.find({
        businessId: businessUnitId,
        createdBy: this.userId,
        isStatusSeenByCreator: false
    });
});

Core.publish("TravelRequest", function (requisitionId) {
    return TravelRequisitions.find({_id: requisitionId});
});
Core.publish("TravelRequestToRetire1", function (requisitionId) {
    return TravelRequisitions.find({_id: requisitionId});
});

Core.publish("TravelRequestsToApprove1", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }
    let userPositionId = user.employeeProfile.employment.position

    return TravelRequisitions.find({
        businessId: businessUnitId,
        $or: [{supervisorPositionId : userPositionId},
                {alternativeSupervisorPositionId: userPositionId}]
    });
});


Core.publish("TravelRequestsToTreat1", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }

    let userPositionId = user.employeeProfile.employment.position

    if (Core.hasTravelRequisitionApproveAccess(this.userId)) {
        return TravelRequisition2s.find({
            businessId: businessUnitId,
            status: 'Approved'
        });
    } else {
        return Meteor.Error(401, "Unauthorized! You don't have the 'Travel Requisition Approve' role");
    }
});
