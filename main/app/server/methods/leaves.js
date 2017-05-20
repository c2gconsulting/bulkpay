/**
 *  Leave Types Methods
 */
Meteor.methods({

    "leave/create": function(leave, currentYearAsNumber){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();
        this.unblock();

        try {
            let userLeaveEntitlement = UserLeaveEntitlements.findOne({
                businessId: leave.businessId, userId: userId
            })
            if(!userLeaveEntitlement) {
                let errMsg = "Sorry, you do not have a leave entitlement set yet. Please meet your HR admin."
               throw new Meteor.Error(401, errMsg);
            }

            let userDaysLeftHistory = userLeaveEntitlement.leaveDaysLeft
            let indexOfFoundYear = -1
            let foundDaysLeftInYear = _.find(userDaysLeftHistory, (aYearData, indexOfYear) => {
                if(aYearData.year === currentYearAsNumber) {
                    indexOfFoundYear = indexOfYear
                    return true
                }
            })

            if(!foundDaysLeftInYear) {
                throw new Meteor.Error(401, "Sorry, you have no leave entitlement for the year");
            }

            if(foundDaysLeftInYear.daysLeft < 1) {
                throw new Meteor.Error(401, "Sorry, you have no leave days left in the year");
            }
            if(foundDaysLeftInYear.daysLeft > leave.duration) {
                Leaves.insert(leave);
                //--
                userDaysLeftHistory[indexOfFoundYear] = {
                    year: currentYearAsNumber,
                    daysLeft: foundDaysLeftInYear.daysLeft - leave.duration
                }

                delete userLeaveEntitlement.createdAt
                
                UserLeaveEntitlements.update(userLeaveEntitlement._id, {$set: userLeaveEntitlement})
                return true
            } else {
                throw new Meteor.Error(401, "Sorry, you do not have enough leave days for this leave request");
            }
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    "leave/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete and if leave type can be deleted
        if(Core.hasLeaveManageAccess(this.userId)){
            LeaveTypes.remove({_id: id});
            return true;
        } else {
            console.log("got here");
            let doc = Leaves.findOne({_id: id});
            if(doc && doc.employeeId == this.userId && doc.approvalStatus !== "Approved"){
                Leaves.remove({_id: id});
                return true;
            }
            throw new Meteor.Error(401, "Unauthorized");
        }

    },
    'approveTimeData': function(timeObj){
        check(timeObj, Object);
        switch (timeObj.type){
            case 'Leaves':
                if(Core.hasLeaveApprovalAccess(this.userId)){
                    let request = Leaves.findOne({_id: timeObj.id});
                    if (request && request.approvalStatus === 'Open'){  //cannot approve self leave
                        if(request.employeeId === this.userId)
                            throw new Meteor.Error('401', 'Cannot Approve your own Request');
                        const approval = Leaves.update({_id: timeObj.id}, {$set: {approvalStatus: 'Approved', approvedBy: this.userId, approvedDate: new Date()}})
                        return approval;
                    } else {
                        throw new Meteor.Error('403', 'No action can be taken when Leave is not Open')
                    }
                } else {
                    throw new Meteor.Error('401', 'Unauthorized');
                }
            case 'TimeWritings':
                if(Core.hasTimeApprovalAccess(this.userId)){
                    let time = TimeWritings.findOne({_id: timeObj.id});
                    if(time && time.status === 'Open') {
                        if (time.employeeId === this.userId)
                            throw new Meteor.Error('401', 'Cannot approve your own Timesheet');
                        const approval = TimeWritings.update({_id: timeObj.id}, {$set: {status: 'Approved', approvedBy: this.userId, approvedDate: new Date()}});
                        return approval;
                    } else {
                        throw new Meteor.Error('403', 'No action can be taken when Time is not Open')
                    }
                } else {
                    throw new Meteor.Error('401', 'Unauthorized');
                }
        }
    },

    'rejectTimeData': function(timeObj){
        check(timeObj, Object);
        switch (timeObj.type){
            case 'Leaves':
                if(Core.hasLeaveApprovalAccess(this.userId)){
                    let request = Leaves.findOne({_id: timeObj.id});
                    if (request && request.approvalStatus === 'Open'){  //cannot approve self leave
                        if(request.employeeId === this.userId)
                            throw new Meteor.Error('401', 'Cannot Approve your own Request');
                        const approval = Leaves.update({_id: timeObj.id}, {$set: {approvalStatus: 'Rejected', approvedBy: this.userId, approvedDate: new Date()}})
                        return approval;
                    } else {
                        throw new Meteor.Error('403', 'No action can be taken when Leave is not Open')
                    }
                } else {
                    throw new Meteor.Error('401', 'Unauthorized');
                }
            case 'TimeWritings':
                if(Core.hasTimeApprovalAccess(this.userId)){
                    let time = TimeWritings.findOne({_id: timeObj.id});
                    if(time && time.status === 'Open') {
                        if (time.employeeId === this.userId)
                            throw new Meteor.Error('401', 'Cannot approve your own Timesheet');
                        const approval = TimeWritings.update({_id: timeObj.id}, {$set: {status: 'Rejected', approvedBy: this.userId, approvedDate: new Date()}});
                        return approval;
                    } else {
                        throw new Meteor.Error('403', 'No action can be taken when Time is not Open')
                    }
                } else {
                    throw new Meteor.Error('401', 'Unauthorized');
                }
        }
    },
    "Leaves/markAsSeen": function(businessUnitId, leaveId){
        check(businessUnitId, String);
        this.unblock()

        let leaveRequest = Leaves.findOne({_id: leaveId})
        if(leaveRequest && leaveRequest.employeeId === Meteor.userId()) {
            Leaves.update(leaveId, {$set: {isApprovalStatusSeenByCreator: true}})
            return true;
        } else {
            throw new Meteor.Error(401, "Unauthorized. You didn't create that leave request")
        }
    }
});
