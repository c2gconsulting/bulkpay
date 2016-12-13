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
