Meteor.methods({
    "parseEmployeeSupplementaryLeaveBalanceUpload": function(data, businessId){
        check(data, Array);
        check(businessId, String);

        this.unblock()

        let successCount = 0;
        let skipped = [];
        let skippedCount = 0;
        let errorCount = 0;
        let errors = [];
        //--
        _.each(data, function (d, index) {
            if (Object.keys(d).length === 1) {
                data.splice(index, 1);
            }
        });

        let dataLength = data.length;

        for (let i = 0; i < dataLength; i++) {
            let item = data[i];
            let employeeId = item.EmployeeUniqueId;
            let LeaveBalance = item.LeaveBalanceInDays;

            if(!LeaveBalance || isNaN(LeaveBalance)) {
                item.ErrorLine = (i + 1)
                item.Error = "Leave balance is not a number"
                skipped.push(item);
                skippedCount += 1
            } else {
                let LeaveBalanceAsNumber = parseFloat(LeaveBalance)

                if(employeeId && employeeId.trim().length > 0) {
                    let employee = Meteor.users.findOne({_id: employeeId})
                    if(employee) {
                        try {
                            SupplementaryLeaves.insert({
                                businessId: businessId,
                                numberOfLeaveDays: LeaveBalanceAsNumber,
                                employees: [employeeId]
                            });
                            successCount += 1
                        } catch (dbException) {
                            item.ErrorLine = (i + 1)
                            item.Error = dbException.message;
                            errors.push(item);
                            errorCount += 1
                        }
                    } else {
                        item.ErrorLine = (i + 1)
                        item.Error = "Employee does not exist"
                        skipped.push(item);
                        skippedCount += 1
                    }
                } else {
                    item.ErrorLine = (i + 1)
                    item.Error = "Employee id was not specified"
                    skipped.push(item);
                    skippedCount += 1
                }
            }
        }
        console.log(`Supplementary leave balance upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
