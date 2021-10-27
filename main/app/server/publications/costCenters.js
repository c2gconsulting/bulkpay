/**
 * CostCenters publications
 */

 Meteor.publish("costcenters", function (businessId) {
    if(businessId) {
        check(businessId, String);
        return CostCenters.find({businessId: businessId});
    }
    //enhnace this method..
});

/**
 * CostCenter
 */

Core.publish("costcenter", function (id) {
    return CostCenters.find({_id: id})
});
