/**
 * Projects publications
 */

Core.publish("timedata", function (businessId) {
    this.unblock(); // eliminate wait time impact
    //return [Times.find({}),Leaves.find({})];
    check(businessId, String);
    let currentId = this.userId;
    let user = Meteor.users.findOne({_id: currentId});
    if (user && user.employeeProfile.employment.position){
        let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
            return x._id
        });
        //console.log(positions);
        //return all meteor users in that position
        let selector = { "businessIds": businessId, employee: true, "employeeProfile.employment.position": {$in: positions} };
        let allSubs = Meteor.users.find(selector).fetch().map(x => {
            //get unique ids of users
            return x._id;
        });
        allSubs.push(currentId);
        return [Times.find({employeeId: {$in: allSubs}}), Leaves.find({employeeId: {$in: allSubs}}), LeaveTypes.find({businessId: businessId, status: 'Active'}), UserImages.find({})]
    } else {
        return this.ready();
    }
});

