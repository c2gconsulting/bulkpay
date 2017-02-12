/**
 * Constant publications
 */

Core.publish("Constants", function (filter, limit, sort) {
    let user = this.userId;
    if (Core.hasPayrollAccess(this.userId)){
        return Constants.find(filter,{sort: sort, limit: limit});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }

    return this.ready();
});

Core.publish("getbuconstants", function(bId){
    if (Core.hasPayrollAccess(this.userId)){
        return Constants.find({businessId: bId});
    } else {
        return Meteor.Error(401, "Unauthorized");
    }

    return this.ready();
})
