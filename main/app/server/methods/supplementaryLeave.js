/**
 *  Supplementary leave Methods
 */
Meteor.methods({

    /* SupplementaryLeave
     */
    "supplementaryLeave/create": function(supplementaryLeave){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        let userId = Meteor.userId();

        try {
            check(supplementaryLeave, Core.Schemas.SupplementaryLeave);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the leave data sent. Please correct and retry");
        }

        let supplementaryLeaveId = SupplementaryLeaves.insert(supplementaryLeave);
        return {_id: supplementaryLeaveId};
    },
    "supplementaryLeave/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete

        SupplementaryLeaves.remove({_id: id});
        return true;
    },
    "supplementaryLeave/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        const result = SupplementaryLeaves.update(selector, {$set: details} );
        return result;
    }
});

