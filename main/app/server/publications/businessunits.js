/**
 * BusinessUnit publications
 */

Core.publish("BusinessUnits", function () {
    let user = this.userId;
    if (Core.hasPayrollAccess(user) || Core.hasEmployeeAccess(user)) {
        return BusinessUnits.find();
    } else {
        let found = Meteor.users.findOne({_id: user});
        // user not authorized. do not publish business units
        if(found.businessIds){
            return BusinessUnits.find({_id: {$in: found.businessIds}});
        } else{
            return this.ready();
        }
    }
});

/**
 * Business units
 */

Core.publish("BusinessUnit", function (id) {
    //if (Core.hasPayrollAccess(this.userId) || Core.hasEmployeeAccess(this.userId)) {
        return BusinessUnits.find({_id: id})//return BusinessUnits.find();
    //} else {
    //    // user not authorized. do not publish business units
    //    return this.ready();
    //}
});