/**
 *  Leave Types Methods
 */
Meteor.methods({

    "leave/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and if leave type can be deleted
        if(Core.hasLeaveManageAccess(this.userId)){
            LeaveTypes.remove({_id: id});
            return true;
        } else {
            console.log("got here");
            let doc = Leaves.findOne({_id: id});
            if(doc && doc.employeeId == this.userId && doc.approvalStatus !== "Approved"){
                Leaves.remove({_id: id});
                return true;
            }
            throw new Meteor.Error(401, "Unauthorized");
        }

    }

});

