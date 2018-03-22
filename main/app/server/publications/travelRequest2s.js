/**
 * Travel Request publications
 */

Core.publish("TravelRequestsICreated", function (businessUnitId) {
    let user = this.userId;

    return travelrequisition2s.find({businessId: businessUnitId, createdBy: this.userId});
});

Core.publish("TravelRequestsStatusNotSeen", function (businessUnitId) {
    let user = this.userId;
    return travelrequisition2s.find({
        businessId: businessUnitId,
        createdBy: this.userId,
        isStatusSeenByCreator: false
    });
});

Core.publish("TravelRequest", function (requisitionId) {
    return travelrequisition2s.find({_id: requisitionId});
});

Core.publish("TravelRequestsToApprove", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }
    let userPositionId = user.employeeProfile.employment.position

    return travelrequisition2s.find({
        businessId: businessUnitId,
        $or: [{supervisorPositionId : userPositionId}, 
                {alternativeSupervisorPositionId: userPositionId}]
    });
});

Core.publish("TravelRequestsToTreat", function (businessUnitId) {
    let user = Meteor.users.findOne({_id: this.userId})

    if(!user.employeeProfile || !user.employeeProfile.employment) {
        return Meteor.Error(401, "Unauthorized! You can't approve a travel request");
    }

    let userPositionId = user.employeeProfile.employment.position

    if (Core.hastravelrequisition2ApproveAccess(this.userId)) {
        return travelrequisition2s.find({
            businessId: businessUnitId,
            status: 'Approved'
        });
    } else {
        return Meteor.Error(401, "Unauthorized! You don't have the 'Travel Requisition Approve' role");
    }
});
