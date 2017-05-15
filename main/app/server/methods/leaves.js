/**
 *  Leave Types Methods
 */
Meteor.methods({

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
