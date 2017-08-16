
// Core.publish("Leaves", function (filter, limit, sort) {
//     let leavesCursor = Leaves.find(filter, {sort: sort, limit: limit});
//     let leaves = leavesCursor.fetch();
//     if (leaves && leaves.length > 0){
//         let employeeIds = _.pluck(leaves, "employeeId");
//         return [leavesCursor, Meteor.users.find({_id: {$in: employeeIds}})]
//     }
//     return this.ready();
//     //enhnace this method..
// });

// Core.publish("employeeLeaves", function (bid, limit, sort) {
//     let user = this.userId;
//     if(bid && user){
//         let cursor = Leaves.find({businessId: bid, employeeId: user});
//         let leaves = _.uniq(cursor.fetch().map(x => {
//             if(x.type && x.type !== undefined)
//                 return x.type;
//         }));
//         return [cursor, LeaveTypes.find({_id: {$in: leaves}})];
//     }
//     return this.ready();
// });

Core.publish("employeeApprovedLoans", function (bid) {
    let user = this.userId;
    if(bid && user){
        let cursor = Loans2.find({
            businessId: bid, 
            employeeId: user,
            approvalStatus: 'Approved'
        });
        return cursor
    }
    return this.ready();
});


Core.publish("employeeLoansNoPagination", function (bid) {
    let user = this.userId;
    
    if(bid && user) {
        let cursor = Loans2.find({businessId: bid, employeeId: user});
        return cursor
    }
    return this.ready();
});
