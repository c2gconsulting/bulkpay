/**
 * companies
 */

Core.publish("Companies", function (tenantId) {
    return Companies.find({tenantId: tenantId})
});

/**
 * company
 */

Core.publish("Company", function (id) {
    return Companies.find({_id: id})
});