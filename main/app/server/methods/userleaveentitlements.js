Meteor.methods({
  "userleaveentitlements/get": function(userId){
    if(!this.userId){
        throw new Meteor.Error(401, "Unauthorized");
    }
      
    return UserLeaveEntitlements.findOne({userId: userId});
  }
});

