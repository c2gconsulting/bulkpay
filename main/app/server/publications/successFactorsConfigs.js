/**
 * SuccessFactorsIntegrationConfigs publications
 */

Core.publish("SuccessFactorsIntegrationConfigs", function (businessUnitId) {
  let user = this.userId;

  return SuccessFactorsIntegrationConfigs.find({businessId: businessUnitId});
});
