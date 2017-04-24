/**
 * Created by eariaroo on 4/24/17.
 */

/**
 * BusinessUnitCustomConfig publications
 */

Core.publish("BusinessUnitCustomConfig", function (businessUnitId, tenantId) {
    let user = this.userId;
    if (user) {
        let bizCustomConfig = BusinessUnitCustomConfigs.find({
          businessId: businessUnitId,
          _groupId: tenantId
        })
        return bizCustomConfig
    } else {
        return Meteor.Error(401, "Unauthorized");
    }
});
