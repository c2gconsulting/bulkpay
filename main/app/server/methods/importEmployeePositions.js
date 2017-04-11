Meteor.methods({
    "parseEmployeePositionsUpload": function(data, businessId){
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
            let positionId = item.PositionUniqueId;

            if(employeeId && employeeId.trim().length > 0) {
                let employee = Meteor.users.findOne({_id: employeeId})
                if(employee) {
                    let positionId = item.PositionUniqueId;
                    if(positionId) {
                        let doesPositionExist = EntityObjects.findOne({_id: positionId, otype: 'Position'});

                        if (doesPositionExist) {
                            try {
                                Meteor.users.update(employee._id, {$set: {'employeeProfile.employment.position': positionId}})
                                successCount += 1
                            } catch (dbException) {
                                item.ErrorLine = (i + 1)
                                item.Error = dbException.message;
                                errors.push(item);
                                errorCount += 1
                            }
                        } else {
                            console.log(`Position id does not exist`)
                            item.ErrorLine = (i + 1)
                            item.Error = "That position id does not exist"
                            skipped.push(item);
                            skippedCount += 1
                        }
                    } else {
                        console.log(`Position id empty`)
                        item.ErrorLine = (i + 1)
                        item.Error = "Position id was not specified"
                        skipped.push(item);
                        skippedCount += 1
                    }
                } else {
                    console.log(`Employee id empty`)
                    item.ErrorLine = (i + 1)
                    item.Error = "Employee id was not specified"
                    skipped.push(item);
                    skippedCount += 1
                }
            }
        }
        console.log(`Employee positions upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
