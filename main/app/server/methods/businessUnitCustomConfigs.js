
/**
 *  BusinessUnitCustomConfig Methods
 */
Meteor.methods({
    'BusinessUnitCustomConfig/getConfig': function (businessUnitId) {
        console.log(`Inside BusinessUnitCustomConfig/getConfig ... businessUnitId: ${businessUnitId}`)
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        return BusinessUnitCustomConfigs.findOne({businessId: businessUnitId});
    }
})
