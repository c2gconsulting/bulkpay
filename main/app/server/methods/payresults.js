
/**
 *  PayResults Methods
 */
Meteor.methods({
    "PayResults/getEmployeesPayrunAndPayresults": function(businessId, employeeIds, periodFormat){
        if(!this.userId){
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock()
        
        let payResults = PayResults.find({employeeId: {$in: employeeIds}, period: periodFormat}).fetch();
        let payRuns = Payruns.find({employeeId: {$in: employeeIds}, period: periodFormat}).fetch();

        return {payResults, payRuns}
    }
});
