import _ from 'underscore';

/**
 *  EmployeePaytypesUpload Methods
 */

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

        let processPaytypesForEmployees = function(employee, item, employeeNewPaygrade) {
            let userPaytypes = []
            Object.keys(item).forEach(anItemProperty => {
                if(anItemProperty !== 'EmployeeUniqueId' && anItemProperty !== 'PaygradeUniqueId'
                    && anItemProperty !== 'EmployeeFullName') {
                    let payTypeHyphenSeparatorIndex = anItemProperty.indexOf('-')
                    if(payTypeHyphenSeparatorIndex > 0) {
                        let payTypeId = anItemProperty.substring(payTypeHyphenSeparatorIndex + 1)
                        
                        let isPayTypeAllowed = _.find(employeeNewPaygrade.payTypes, function(aPayType) {
                            return aPayType.paytype === payTypeId
                        })
                        if (isPayTypeAllowed) {
                            let payTypeAmount = item[anItemProperty]
                            let payTypeAmountWithNoCommas = payTypeAmount.replace(/,/g, "").trim();
                            userPaytypes.push({paytype: payTypeId, value: payTypeAmountWithNoCommas})
                        }
                    }
                }
            })
            Meteor.users.update(employee._id, {
                $set: {'employeeProfile.employment.paytypes': userPaytypes}
            })
            successCount += 1
        }
        //-- ----------
        let dataLength = data.length;
        for (let i = 0; i < dataLength; i++) {
            let item = data[i];
            let employeeId = item.EmployeeUniqueId;
            let paygradeId = item.PaygradeUniqueId;

            if(!employeeId || employeeId.trim().length < 1) {
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
                    item.ErrorLine = (i + 1)
                    item.Error = "Paygrade id was not specified"
                    skipped.push(item);
                    skippedCount += 1
                    continue
                }
                //--
                let employeeNewPaygrade = PayGrades.findOne({_id: paygradeId});
                if (!employeeNewPaygrade) {
                    item.ErrorLine = (i + 1)
                    item.Error = "That paygrade id does not exist"
                    skipped.push(item);
                    skippedCount += 1
                    continue
                }
                try {
                    Meteor.users.update(employee._id, {$set: {'employeeProfile.employment.paygrade': paygradeId}})
                    processPaytypesForEmployees(employee, item, employeeNewPaygrade)
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
