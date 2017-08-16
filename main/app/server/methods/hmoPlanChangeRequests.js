
/**
 *  HMO Plan Change Methods
 */
Meteor.methods({
    "hmoPlanChangeRequests/create": function(changeRequest){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let user = Meteor.users.findOne(this.userId)
        if(user) {
            let hmoPlanType = changeRequest.hmoPlanType
            if(hmoPlanType) {
                let hmoPlan = HmoPlans.findOne(hmoPlanType)

                if(changeRequest._id) {
                    HmoPlanChangeRequests.update(changeRequest._id, 
                        {$set: {hmoPlanType: changeRequest.hmoPlanType}})
                } else {
                    HmoPlanChangeRequests.insert(changeRequest)
                }
                return true
            } else {
                throw new Meteor.Error(401, "Validation Error. HMO not selected");
            }
        } else {
            throw new Meteor.Error(401, "Unauthorized");
        }
    },
    "hmoPlanChangeRequests/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        
        let doc = HmoPlanChangeRequests.findOne({_id: id});
        if(!doc) {
            throw new Meteor.Error(401, "Sorry, your HMO change request could not be found");
        }
        if(doc.employeeId !== this.userId) {
            throw new Meteor.Error(401, "Unauthorized. You cannot delete a HMO Plan change request you did not create.");
        }
        if(doc.approvalStatus === "Open") {
            HmoPlanChangeRequests.remove({_id: id});
            return true;
        } else {
            throw new Meteor.Error(401, "You cannot delete a HMO Plan change request that has already been approved or rejected.");
        }
    }
});
