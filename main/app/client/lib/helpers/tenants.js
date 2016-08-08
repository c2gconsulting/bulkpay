/**
 * tenant  
 */   
Template.registerHelper('tenant', function(){
  let tenant = Tenants.findOne();
  if (tenant) return tenant;
}); 

/**
 * tenantId  
 */		
Template.registerHelper('tenantId', function(){
  let tenant = Tenants.findOne();
  if (tenant) return tenant._id;
}); 

/**
 * tenantName
 * @summary get the tenant name
 * @return {String} returns tenant name
 */
Template.registerHelper("tenantName", function () {
  let tenant = Tenants.findOne();
  if (tenant && tenant.name) return tenant.name;
});

/**
 * tenantCreatedAt
 * @summary get the tenant created at
 * @return {String} returns tenant created at
 */
Template.registerHelper("tenantCreatedAt", function () {
  let tenant = Tenants.findOne();
  if (tenant && tenant.createdAt) return Math.round(tenant.createdAt.getTime() / 1000);
});

/**
 * tenantUrl
 * @summary get the tenant url
 * @return {String} returns site name
 */
Template.registerHelper("tenantUrl", function () {
	return document.location.hostname;
  /*
  let tenant = Tenants.findOne();
  if (tenant && tenant.domains && tenant.domains.length > 0) return tenant.domains[0];
  */
});

