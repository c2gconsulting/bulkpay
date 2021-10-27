/**
 * Projects publications
 */

Core.publish("projects", function (businessId, limit = 50, sort) {
    // let user = this.userId;
    // if (Core.hasTimeManageAccess(this.userId)){
    //     return Projects.find(filter,{sort: sort, limit: limit});
    // } else {
    //     return Meteor.Error(401, "Unauthorized");
    // }

    console.log('this.userId', this.userId)
    check(businessId, String);
    return Projects.find({businessId: businessId});

    // return this.ready();
});


Core.publish("project", function (id) {
    return Projects.find({_id: id})
});

Core.publish("employeeprojects", function (bid) {
    let userId = this.userId;
    //get user current position
    let user = Meteor.users.findOne({_id: userId});
    if (Core.hasSelfServiceAccess(this.userId) && user){
        //return Projects.find({positionIds: position, businessId: bid, status: "Active"});
        return Projects.find({businessId: bid, status: "Active"});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }
    //return this.ready();
});

