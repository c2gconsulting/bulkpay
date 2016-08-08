/**
* Core Schemas Email
*/

Core.Schemas.Email = new SimpleSchema({
  provides: {
    type: String,
    defaultValue: "default",
    optional: true
  },
  address: {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  verified: {
    type: Boolean,
    defaultValue: false,
    optional: true
  }
});

/**
* Core Schemas Address
*/
Core.Schemas.Address = new SimpleSchema({
  _id: {
    type: String,
    autoValue: Core.schemaIdAutoValue,
    optional: true
  },
  fullName: {
    type: String,
    label: "Full name"
  },
  address1: {
    label: "Address 1",
    type: String
  },
  address2: {
    label: "Address 2",
    type: String,
    optional: true
  },
  city: {
    type: String,
    label: "City",
    optional: true
  },
  company: {
    type: String,
    label: "Company",
    optional: true
  },
  phone: {
    type: String,
    label: "Phone",
    optional: true
  },
  state: {
    label: "State/Province/Region",
    type: String,
    optional: true
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    optional: true
  },
  isCommercial: {
    label: "This is a commercial address.",
    type: Boolean,
    optional: true
  },
  isBillingDefault: {
    label: "Make this your default billing address?",
    type: Boolean,
    optional: true
  },
  isShippingDefault: {
    label: "Make this your default shipping address?",
    type: Boolean,
    optional: true
  },
  metafields: {
    type: [Core.Schemas.Metafield],
    optional: true
  },
  originAddressId: {
    type: String,
    optional: true
  }
});
