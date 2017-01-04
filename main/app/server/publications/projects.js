/**
 * Projects publications
 */

Core.publish("projects", function (filter, limit, sort) {
    let user = this.userId;
    if (Core.hasTimeManageAccess(this.userId)){
        return Projects.find(filter,{sort: sort, limit: limit});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }

    return this.ready();
});


Core.publish("employeeprojects", function (bid) {
    let userId = this.userId;
    //get user current position
    let user = Meteor.users.findOne({_id: userId});
    if (Core.hasSelfServiceAccess(this.userId) && user){
        let position = user.employeeProfile.employment.position;
        if(position){
            return Projects.find({positionIds: position, businessId: bid, status: "Active"});
        }
    } else {
        return Meteor.Error(401, "Unauthorized");
    }
    return this.ready();
});

