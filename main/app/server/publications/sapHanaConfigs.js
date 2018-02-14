/**
 * SapHanaIntegrationConfigs publications
 */

Core.publish("SapHanaIntegrationConfigs", function (businessUnitId) {
  let user = this.userId;

  return SapHanaIntegrationConfigs.find({businessId: businessUnitId});
});
