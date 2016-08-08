/*
 * TaxRate Schema
 */
Core.Schemas.TaxRate = new SimpleSchema({
  country: {
    type: String //ISO 2-digit country code
  },
  county: {
    type: String, //optional, for jurisdiction based taxes
    optional: true
  },
  rate: {
    type: Number,
    decimal: true,
    min: 0,
    max: 100
  }
});

/*
 * TaxRate Schema
 */
Core.Schemas.Tax = new SimpleSchema({
  taxLocale: {
    label: "Taxation Location",
    type: String,
    allowedValues: ["origin", "destination"],
    defaultValue: "origin",
    optional: true
  },
  code: {
    type: String,
    unique: true
  },
  description: {
    type: String
  },
  shortName: {
    type: String
  },
  taxShipping: {
    label: "Tax Shipping",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  taxIncluded: {
    label: "Taxes included in product prices",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  discountsIncluded: {
    label: "Tax before discounts",
    type: Boolean,
    defaultValue: false,
    optional: true
  },
  rates: {
    label: "Tax Rate",
    type: [Core.Schemas.TaxRate],
    optional: true
  }
});
