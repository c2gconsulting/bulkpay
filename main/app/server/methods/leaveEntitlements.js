Meteor.methods({

    "LeaveEntitlement/create": function(leaveEntitlementDoc){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();

        try {
            let newLeaveEntitlementId = LeaveEntitlements.insert(leaveEntitlementDoc);

            if(leaveEntitlementDoc.payGradeIds && leaveEntitlementDoc.payGradeIds.length > 0) {
                let currentYear = moment().startOf('year').toDate()

                let employeesWithPaygrade = Meteor.users.find({
                  'employeeProfile.employment.paygrade': {$in: leaveEntitlementDoc.payGradeIds}
                })
                employeesWithPaygrade.forEach(anEmployee => {
                    let employeeLeaveEntitlement = UserLeaveEntitlements.findOne({userId: anEmployee._id})
                    if(employeeLeaveEntitlement) {
                        let leaveDaysLeftHistory = employeeLeaveEntitlement.leaveDaysLeft || []
                        let leaveDaysLeftForYear = _.find(leaveDaysLeftHistory, (aYear) => {
                            return moment(aYear.year).isSame(moment(currentYear))
                        })
                        if(leaveDaysLeftForYear) {
                            leaveDaysLeftForYear.leaveEntitlementId = newLeaveEntitlementId
                            leaveDaysLeftForYear.daysLeftInYear = leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
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
                                daysLeftInYear: leaveEntitlementDoc.numberOfLeaveDaysPerAnnum
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