/**
 * Divisions publications
 */

Core.publish("Leaves", function (filter, limit, sort) {
    let leavesCursor = Leaves.find(filter, {sort: sort, limit: limit});
    let leaves = leavesCursor.fetch();
    if (leaves && leaves.length > 0){
        let employeeIds = _.pluck(leaves, "employeeId");
        return [leavesCursor, Meteor.users.find({_id: {$in: employeeIds}})]
    }
    return this.ready();
    //enhnace this method..
});

Core.publish("LeaveTypes", function (filter, limit, sort) {
    let leaveTypeCursor = LeaveTypes.find(filter, {sort: sort, limit: limit});
    let leaveTypes = leaveTypeCursor.fetch();
    if (leaveTypes && leaveTypes.length > 0){
        return leaveTypeCursor;
    }
    return this.ready();
    //enhnace this method..
});
