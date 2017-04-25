Meteor.methods({
    "parseEmployeePaytypesUpload": function(data, businessId){
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

        let processPaytypesForEmployees = function() {

        }

        for (let i = 0; i < dataLength; i++) {
            let item = data[i];
            let employeeId = item.EmployeeUniqueId;
            let paygradeId = item.PaygradeUniqueId;

            if(!employeeId || employeeId.trim().length < 1) {
                console.log(`Employee id empty`)
                item.ErrorLine = (i + 1)
                item.Error = "Employee id was not specified"
                skipped.push(item);
                skippedCount += 1
                continue;
            }

            let employee = Meteor.users.findOne({_id: employeeId})
            if(employee) {
                let paygradeId = item.PaygradeUniqueId;
                if(!paygradeId) {
                    console.log(`Paygrade id empty`)
                    item.ErrorLine = (i + 1)
                    item.Error = "Paygrade id was not specified"
                    skipped.push(item);
                    skippedCount += 1
                }
                //--
                let doesPaygradeExist = PayGrades.findOne({_id: paygradeId});
                if (!doesPaygradeExist) {
                    console.log(`Paygrade id does not exist`)
                    item.ErrorLine = (i + 1)
                    item.Error = "That paygrade id does not exist"
                    skipped.push(item);
                    skippedCount += 1
                    continue
                }
                try {
                    Meteor.users.update(employee._id, {$set: {'employeeProfile.employment.paygrade': paygradeId}})
                    item.forEach(anItemProperty => {
                        if(anItemProperty !== 'EmployeeUniqueId' && anItemProperty !== 'PaygradeUniqueId') {
                            let payTypeHyphenSeparatorIndex = anItemProperty.indexOf('-')
                            if(payTypeHyphenSeparatorIndex > 0) {
                                let payTypeId = anItemProperty.subString(payTypeHyphenSeparatorIndex)
                                console.log(`payTypeId: ${payTypeHyphenSeparatorIndex}`)


                                successCount += 1
                            } else {

                            }
                        }
                    })
                } catch (dbException) {
                    item.ErrorLine = (i + 1)
                    item.Error = dbException.message;
                    errors.push(item);
                    errorCount += 1
                }
            }
        }
        console.log(`Employee paytypes upload complete!`)
        return {skippedCount: skippedCount, skipped: skipped, success: successCount, failed: errorCount, errors: errors}
    }
});
