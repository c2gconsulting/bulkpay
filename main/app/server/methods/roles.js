/**
 *  Leave Types Methods
 */
Meteor.methods({
    "role/setRolesForUser": function(userId, arrayOfRoles){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and if leave type can be deleted

        let theUser = Meteor.users.findOne({_id: userId});

        if(theUser) {
          if(theUser.roles) {
            console.log("The user already has a roles key");
          } else {
            console.log("The user does not already have a roles key.")
            Meteor.users.update({_id: userId}, {$set: {
                "roles": {}
            }});
          }
          Roles.setUserRoles(userId, arrayOfRoles, Roles.GLOBAL_GROUP)
        }
        return true;
    }
});
