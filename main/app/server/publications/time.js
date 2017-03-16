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
        const selector = { "businessIds": businessId, employee: true, "employeeProfile.employment.position": {$in: positions} };
        const users = Meteor.users.find(selector).fetch();
        const allSubs = getIds(users);
        allSubs.push(currentId);
        const allPositions = getPositions(allSubs);
        //also publish positions of all employees
        return [Times.find({employeeId: {$in: allSubs}}), Leaves.find({employeeId: {$in: allSubs}}), LeaveTypes.find({businessId: businessId, status: 'Active'}), EntityObjects.find({_id: {$in: allPositions}})];
    } else {
        return this.ready();
    }
});

function getIds(users){
    const newUsers = [...users];
    const ids = newUsers.map(x => {
        //get unique ids of users
        return x._id;
    });
    return ids;
}
function getPositions(users){
    //users array of user ids
    // no need for additional queries / multiple queries,
    //use already queried user data
    const newArray = Meteor.users.find({_id: {$in: users}}).fetch().map(x => {
        if(x.employeeProfile.employment.position)
            return x.employeeProfile.employment.position
    });
    console.log('positions to sub for include', newArray);
    return newArray;
}
