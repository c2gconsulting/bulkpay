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


Core.publish("employeeLeaveTypes", function (bid) {
    let user = this.userId;
    if(bid && user){
        let found = Meteor.users.findOne({_id: user});
        if(found.employee){
            let positions = found.employeeProfile.employment.position;
            let paygrade = found.employeeProfile.employment.paygrade;
            console.log(positions);
            console.log(paygrade);
            //return leavetypes of user in either positions or paygrades
            return LeaveTypes.find({$or: [{positionIds: positions}, {payGradeIds: paygrade}]})
        }
    }
    return this.ready();
});

Core.publish("employeeLeaves", function (bid, limit, sort) {
    let user = this.userId;
    if(bid && user){
        let cursor = Leaves.find({businessId: bid, employeeId: user});
        let leaves = _.uniq(cursor.fetch().map(x => {
            if(x.type && x.type !== undefined)
                return x.type;
        }));
        console.log(leaves);
        return [cursor, LeaveTypes.find({_id: {$in: leaves}})];
    }
    return this.ready();
});
