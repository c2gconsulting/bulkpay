import _ from 'underscore';


let LeaveCreateHelpers = {
    createByFixedEntitlement: function(userId, leave, currentYearAsNumber) {
        try {
            let userLeaveEntitlement = UserLeaveEntitlements.findOne({
                businessId: leave.businessId, userId: userId
            })
            if(!userLeaveEntitlement) {
                let errMsg = "Sorry, you do not have a leave entitlement set yet. Please meet your HR admin."
               throw new Meteor.Error(401, errMsg);
            }

            let leaveYear = leave.startDate
            let leaveYearAsNumber = parseInt(moment(leaveYear).year())

            let userDaysLeftHistory = userLeaveEntitlement.leaveDaysLeft
            let indexOfFoundYear = -1
            let foundDaysLeftInYear = _.find(userDaysLeftHistory, (aYearData, indexOfYear) => {
                if(aYearData.year === leaveYearAsNumber) {
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
            if(foundDaysLeftInYear.daysLeft >= leave.duration) {
                Leaves.insert(leave);
                return true
            } else {
                throw new Meteor.Error(401, "Sorry, you do not have enough leave days for this leave request");
            }
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    createByNumHoursEmployed: function(userId, leave, currentYearAsNumber) {
        try {
            let businessUnitCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: leave.businessId})

            if(businessUnitCustomConfig) {

            }
            let suppLeavesForUser = SupplementaryLeaves.findOne({
                businessId: leave.businessId, 
                employees: {$in: [userId]}
            });

            let user = Meteor.users.findOne(userId)
            let numberOfDaysSinceResumption = 0
            if(user) {
                if(!user.employeeProfile) {
                    new Meteor.Error(401, "Sorry, employee profile is empty");
                }
                if(!user.employeeProfile.employment) {
                    new Meteor.Error(401, "Sorry, employee employment details is empty");
                }
                let hireDate = user.employeeProfile.employment.hireDate
                if(hireDate) {
                    let hireDateAsMoment = moment(hireDate)

                    numberOfDaysSinceResumption = moment().diff(hireDateAsMoment, 'days')
                } else {
                    new Meteor.Error(401, "Sorry, employee hire date is not set.");
                }
            }
            const employeePaygradeId = user.employeeProfile.employment.paygrade;
            if(!employeePaygradeId) {
                new Meteor.Error(401, "Sorry, employee does not have Pay Grade");
            }
            const payGrade = PayGrades.findOne({_id: employeePaygradeId})
            let payGradeLeaveConfig;
            if(payGrade) {
                payGradeLeaveConfig = payGrade.leaveRequest
            }

            if(!payGradeLeaveConfig || payGradeLeaveConfig === 'Limited') {
                let leaveTypesWithoutDeduction = LeaveTypes.find({
                    deductFromAnnualLeave: false
                }).fetch();
                let theLeaveTypeIds = _.pluck(leaveTypesWithoutDeduction, '_id');
    
                let hoursOfLeaveApproved = 0
                let userApprovedLeaves = Leaves.find({
                    businessId: leave.businessId, 
                    employeeId: userId,
                    approvalStatus: 'Approved',
                    type: {$nin: theLeaveTypeIds}
                }).fetch();
    
                userApprovedLeaves.forEach(aLeave => {
                    hoursOfLeaveApproved += aLeave.durationInHours
                })
                //--
                let numSupplementaryLeaveDays = 0
                if(suppLeavesForUser) {
                    numSupplementaryLeaveDays = suppLeavesForUser.numberOfLeaveDays
                }
                //--
                let numberOfLeaveDaysLeft = (0.056 * numberOfDaysSinceResumption) - (hoursOfLeaveApproved / 24) + numSupplementaryLeaveDays
    
                if(numberOfLeaveDaysLeft > leave.duration) {
                    Leaves.insert(leave);
                    return true
                } else {
                    throw new Meteor.Error(401, "Sorry, you do not have enough leave days for this leave request");
                }
            } else {
                Leaves.insert(leave);
                return true            
            }
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    },
    getSupervisorsForLeaveRequest: function(leaveRequest) {
        let currentUser = Meteor.users.findOne(leaveRequest.employeeId)

        if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
            let userPositionId = currentUser.employeeProfile.employment.position

            let userPositionObj = EntityObjects.findOne({
                _id: userPositionId,
                otype: 'Position'
            })
            
            if(userPositionObj && userPositionObj.properties) {
                let allSupervisors = []

                let supervisorId = userPositionObj.properties.supervisor
                let alternateSupervisorId = userPositionObj.properties.alternateSupervisor

                if(supervisorId) {
                    let supervisor = Meteor.users.findOne({
                        'employeeProfile.employment.position': supervisorId
                    })
                    if(supervisor) {
                        allSupervisors.push(supervisor)
                    }
                }
                if(alternateSupervisorId) {
                    let alternateSupervisor = Meteor.users.findOne({
                        'employeeProfile.employment.position': alternateSupervisorId
                    })
                    if(alternateSupervisor) {
                        allSupervisors.push(alternateSupervisor)
                    }
                }
                return allSupervisors
            }
        }
        return []
    }
}


/**
 *  Leave Types Methods
 */
Meteor.methods({
    "leave/create": function(leave, currentYearAsNumber){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }        
        this.unblock();

        const leaveTypeId = leave.type;
        const leaveType = LeaveTypes.findOne(leaveTypeId)

        if(leaveType) {
            const user = Meteor.user();
            const userPaygradeId = user.employeeProfile.employment.paygrade;

            let allowedPaygrades = leaveType.payGradeIds || []
            
            let isLeaveTypeAllowed = _.find(allowedPaygrades, aPayGrade => {
                return aPayGrade === userPaygradeId
            })
            if(isLeaveTypeAllowed) {
                let businessUnitCustomConfig = BusinessUnitCustomConfigs.findOne({businessId: leave.businessId})
                
                if(businessUnitCustomConfig) {
                    if(businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement') {
                        return LeaveCreateHelpers.createByFixedEntitlement(Meteor.userId(), leave, currentYearAsNumber)
                    } else if(businessUnitCustomConfig.leaveDaysAccrual === 'NumberOfDaysWorked') {
                        return LeaveCreateHelpers.createByNumHoursEmployed(Meteor.userId(), leave, currentYearAsNumber)
                    }
                }
            } else {
                throw new Meteor.Error(401, "Sorry, the leave type is not allowed for your pay grade.");                
            }
        } else {
            throw new Meteor.Error(401, "Sorry, the leave type does not exist.");
        }
    },
    "leave/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        
        let doc = Leaves.findOne({_id: id});
        if(!doc) {
            throw new Meteor.Error(401, "Sorry, that leave request does not exist.");            
        }

        if(doc.employeeId !== this.userId) {
            let supervisors = LeaveCreateHelpers.getSupervisorsForLeaveRequest(doc) || []
            let supervisorIds = _.pluck(supervisors, '_id')
            if(supervisorIds.indexOf(this.userId) < 0) {
                throw new Meteor.Error(401, "Unauthorized. You cannot delete a leave request you did not create.");
            } else {
                Leaves.remove({_id: id});
                return true;                
            }
        } else {
            if(doc.approvalStatus === "Open"){
                Leaves.remove({_id: id});
                return true;
            } else {
                throw new Meteor.Error(401, "You cannot delete a leave request that has already been approved or rejected.");
            }
        }
    },
    'approveTimeData': function(timeObj){
        check(timeObj, Object);
        switch (timeObj.type){
            case 'Leaves':
                if(!Core.hasLeaveApprovalAccess(this.userId)){
                    throw new Meteor.Error('401', 'Unauthorized');
                }
                let request = Leaves.findOne({_id: timeObj.id});
                if (!request || request.approvalStatus !== 'Open'){  //cannot approve self leave
                    throw new Meteor.Error('403', 'No action can be taken when Leave is not Open')
                }
                if(request.employeeId === this.userId) {
                    throw new Meteor.Error('401', 'Cannot Approve your own Request');
                }
                //--
                let userLeaveEntitlement = UserLeaveEntitlements.findOne({
                    businessId: request.businessId, userId: request.employeeId
                })
                if(!userLeaveEntitlement) {
                    throw new Meteor.Error(401, "The employee does not have a leave entitlement");
                }
                let leaveYear = request.startDate
                let leaveYearAsNumber = parseInt(moment(leaveYear).year())

                let userDaysLeftHistory = userLeaveEntitlement.leaveDaysLeft
                let indexOfFoundYear = -1
                let foundDaysLeftInYear = _.find(userDaysLeftHistory, (aYearData, indexOfYear) => {
                    if(aYearData.year === leaveYearAsNumber) {
                        indexOfFoundYear = indexOfYear
                        return true
                    }
                })
                if(!foundDaysLeftInYear) {
                    throw new Meteor.Error(401, "The employee does not have a leave entitlement for the year specified in the leave request");
                }

                if(foundDaysLeftInYear.daysLeft > request.duration) {
                    const approval = Leaves.update({_id: timeObj.id}, 
                        {$set: {approvalStatus: 'Approved', approvedBy: this.userId, approvedDate: new Date()}
                    })
                    userDaysLeftHistory[indexOfFoundYear] = {
                        year: leaveYearAsNumber,
                        daysLeft: foundDaysLeftInYear.daysLeft - request.duration
                    }
                    delete userLeaveEntitlement.createdAt
                    UserLeaveEntitlements.update(userLeaveEntitlement._id, {$set: userLeaveEntitlement})
    
                    return approval;
                } else {
                    throw new Meteor.Error(401, "The employee does not have enough leave days for this leave request");
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
    'approveTimeDataInPeriod': function(startDay, endDay, businessId, supervisorIds){
        if(Core.hasTimeApprovalAccess(this.userId)){
            let queryToFindTimeRecords = {
                day: {$gte: startDay, $lte: endDay}, 
                // businessId: businessId, employeeId: {$in: supervisorIds}
                employeeId: {$in: supervisorIds}
            }
            let timeRecordsToApprove = TimeWritings.find(queryToFindTimeRecords).fetch()
            
            if(timeRecordsToApprove && timeRecordsToApprove.length > 0) {
                let timeRecordIds = timeRecordsToApprove.map(aTimeRecord => {
                    return aTimeRecord._id
                })
                let numRecordsUpdated = TimeWritings.update({
                    _id: {$in: timeRecordIds}
                }, {$set: {approvedBy: this.userId, approvedDate: new Date(), status: 'Approved'}},
                {multi: true})
            }
            //--
            let queryToFindLeaveRecords = {
                startDate: {$gte: startDay}, 
                endDate: {$lte: endDay}, 
                employeeId: {$in: supervisorIds}
            }
            let leavesToApprove = Leaves.find(queryToFindLeaveRecords).fetch()
            if(leavesToApprove && leavesToApprove.length > 0) {
                let leaveRecordIds = leavesToApprove.map(aLeaveRecord => {
                    return aLeaveRecord._id
                })
                Leaves.update({
                    _id: {$in: leaveRecordIds}
                }, {$set: {approvedBy: this.userId, approvedDate: new Date(), approvalStatus: 'Approved'}},
                {multi: true})
            }
            return true
        } else {
            throw new Meteor.Error('401', 'Unauthorized');
        }
    },
    'rejectTimeDataInPeriod': function(startDay, endDay, businessId, supervisorIds){
        if(Core.hasTimeApprovalAccess(this.userId)){
            let queryToFindTimeRecords = {
                day: {$gte: startDay, $lte: endDay}, 
                // businessId: businessId, employeeId: {$in: supervisorIds}
                employeeId: {$in: supervisorIds}
            }
            let timeRecordsToApprove = TimeWritings.find(queryToFindTimeRecords).fetch()            
            if(timeRecordsToApprove && timeRecordsToApprove.length > 0) {
                let timeRecordIds = timeRecordsToApprove.map(aTimeRecord => {
                    return aTimeRecord._id
                })
                let numRecordsUpdated = TimeWritings.update({
                    _id: {$in: timeRecordIds}
                }, {$set: {approvedBy: this.userId, approvedDate: new Date(), status: 'Rejected'}},
                {multi: true})
            }
            //--
            let queryToFindLeaveRecords = {
                startDate: {$gte: startDay}, 
                endDate: {$lte: endDay}, 
                employeeId: {$in: supervisorIds}
            }
            let leavesToApprove = Leaves.find(queryToFindLeaveRecords).fetch()
            if(leavesToApprove && leavesToApprove.length > 0) {
                let leaveRecordIds = leavesToApprove.map(aLeaveRecord => {
                    return aLeaveRecord._id
                })
                Leaves.update({
                    _id: {$in: leaveRecordIds}
                }, {$set: {approvedBy: this.userId, approvedDate: new Date(), approvalStatus: 'Rejected'}},
                {multi: true})
            }
            return true
        } else {
            throw new Meteor.Error('401', 'Unauthorized');
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
