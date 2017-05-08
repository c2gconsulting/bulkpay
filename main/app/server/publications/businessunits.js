/**
 * BusinessUnit publications
 */

Core.publish("BusinessUnits", function () {
    let user = this.userId;

    let found = Meteor.users.findOne({_id: user});
    if(found.businessIds && found.businessIds.length > 0){
        console.log(`usesr businessIds is NOT null`)
        return BusinessUnits.find({_id: {$in: found.businessIds}});
    } else {
        console.log(`usesr businessIds is null`)

        if (Core.hasPayrollAccess(user) || Core.hasEmployeeAccess(user)) {
            return BusinessUnits.find();
        } else {
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

Core.publish("BusinessUnitLogoImage", function (id) {
    return BusinessUnitLogoImages.find({_id: id})
});
