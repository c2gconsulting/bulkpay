/**
 *  HmoPlans Methods
 */
Meteor.methods({
    "hmoPlans/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and if leave type can be deleted
        // if(Core.hasLeaveManageAccess(this.userId)){
            HmoPlans.remove({_id: id});
            return true;
        // } else {
        //     throw new Meteor.Error(401, "Unauthorized");
        // }
    }
});
