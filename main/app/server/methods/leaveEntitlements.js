Meteor.methods({

    "LeaveEntitlement/create": function(leaveEntitlementDoc, currentYear){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        try {
            let newLeaveEntitlementId = LeaveEntitlements.insert(leaveEntitlementDoc);

            if(leaveEntitlementDoc.payGradeIds && leaveEntitlementDoc.payGradeIds.length > 0) {
                let employeesWithPaygrade = Meteor.users.find({
                  'employeeProfile.employment.paygrade': {$in: leaveEntitlementDoc.payGradeIds}
                })
                employeesWithPaygrade.forEach(anEmployee => {
                    let employeeLeaveEntitlement = UserLeaveEntitlements.findOne({userId: anEmployee._id})
                    if(employeeLeaveEntitlement) {
                        let leaveDaysLeftHistory = employeeLeaveEntitlement.leaveDaysLeft || []
                        let leaveDaysLeftForYear = _.find(leaveDaysLeftHistory, (aYear) => {
                            return (aYear.year === currentYear)
                        })
                        if(leaveDaysLeftForYear) {
                            leaveDaysLeftForYear.leaveEntitlementId = newLeaveEntitlementId
                            leaveDaysLeftForYear.daysLeft = leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
                            delete employeeLeaveEntitlement.createdAt

                            UserLeaveEntitlements.update(employeeLeaveEntitlement._id, {$set: employeeLeaveEntitlement})
                        }
                    } else {
                        UserLeaveEntitlements.insert({
                            userId : anEmployee._id,
                            leaveEntitlementId : newLeaveEntitlementId,
                            businessId : leaveEntitlementDoc.businessId,
                            leaveDaysLeft : [{
                                year: currentYear,
                                daysLeft: leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
                            }]
                        })
                    }
                })
            }
            return true
        } catch (e) {
            throw new Meteor.Error(401, e.message);
        }
    }
})