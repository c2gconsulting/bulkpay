/**
 * CurrentTenant
 * @returns {Object} tenant - current tenant cursor
 */

Core.publish("CurrentTenant", function () {
	return Core.getCurrentTenantCursor(this.userId);
});

/**
 * TenantForDomain
 * @returns {Object} tenant - tenant cursor for specified domain
 */
Meteor.publish("TenantForDomain", function (domain) {
	return Tenants.find({
      	domains: domain
    }, {
    	fields: {
    		'addressBook': 1,
    		'baseCurrency': 1,
    		'country': 1,
    		'currencies': 1,
    		'domains': 1,
    		'layout': 1,
    		'locale': 1,
    		'name': 1,
    		'timezone': 1,
            'adminEmail': 1
    	},
      	limit: 1
    });;
});


/**
 * Tenants
 * @returns {Array} all tenants
 */

Core.publish("Tenants", function () {
  return Tenants.find();
});
