Meteor.methods({

    "LeaveEntitlement/create": function(leaveEntitlementDoc){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        try {
            LeaveEntitlements.insert(leaveEntitlementDoc);
            return true
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    }
})