/**
 * taxes
 */

Core.publish("Taxes", function () {
  let tenant = Core.getCurrentTenant(this.userId);
  if (tenant) {
    let country = tenant.country;
    return Taxes.find({
      "rates.country": country
    }, {
      fields: {
        taxLocale: 1,
        code: 1,
        description: 1,
        shortName: 1,
        rates: {
          $elemMatch: {
            country: country
          }
        }
      }
    });
  }
});