/**
 *  paygrade Methods
 */
Meteor.methods({

    /* paygrade
     */

    "paygrade/create": function(paygrade){
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(paygrade, Core.Schemas.PayGrade);
        } catch (e) {
            console.log(e);
            throw new Meteor.Error(401, "There's invalid data in the paygrades. Please correct and retry");
        }
        // if a bu object was provided and valid schema
        //if (Core.hasOrderAccess(userId, order.salesLocationId)) {
        //    // must have orders/manage permissions
        this.unblock();

        let pgId = PayGrades.insert(paygrade);
        return {_id: pgId};
    },
    "paygrade/delete": function(id){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        // check if user has permission to delete
        PayGrades.remove({_id: id});
        return true;
    },
    "paygrade/update": function(id, details){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        //update can only be done by authorized user. so check permission
        check(id, String);
        const selector = {
            _id: id
        };
        let result = PayGrades.update(selector, {$set: details});

        //--We need to update employee paytypes in case new paytypes were added to the paygrade
        let paygradePaytypes = details.payTypes
        let employeesWithPayGrade = Meteor.users.find({'employeeProfile.employment.paygrade': id}).fetch()
        let numberOfEmployeesWithPayGrade = employeesWithPayGrade.length
        //console.log(`numberOfEmployeesWithPayGrade: ${numberOfEmployeesWithPayGrade}`)

        employeesWithPayGrade.forEach(anEmployee => {
            let employeePaytypes = anEmployee.employeeProfile.employment.paytypes
            if(employeePaytypes || employeePaytypes.length > 0) {
                let newPayTypesToInsert = []

                paygradePaytypes.forEach(function(aPayGradePayType) {
                    let employeePayTypeWithVal = null
                    let numOfEmployeePayTypes = employeePaytypes.length
                    for(let i = 0; i < numOfEmployeePayTypes; i++) {
                        let anEmployeePayType = employeePaytypes[i]
                        
                        if(anEmployeePayType) {
                            if(anEmployeePayType.paytype === aPayGradePayType.paytype) {
                                employeePayTypeWithVal = anEmployeePayType
                                break;
                            }
                        }
                    }
                    if(!employeePayTypeWithVal) {
                        delete aPayGradePayType.displayInPayslip
                        newPayTypesToInsert.push(aPayGradePayType);
                    } else {
                        newPayTypesToInsert.push(employeePayTypeWithVal);
                    }
                })
                if(newPayTypesToInsert.length > 0) {
                    result = Meteor.users.update(anEmployee._id,
                        { $set: { 'employeeProfile.employment.paytypes': newPayTypesToInsert }}
                    );
                }
            } else {
                result = Meteor.users.update(anEmployee._id,
                    { $set: { 'employeeProfile.employment.paytypes': paygradePaytypes }}
                );
            }
        })
        return result;
    }
});

