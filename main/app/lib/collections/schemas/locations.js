/**
 * Location Schema
 * locations represent depots, plants or warehouses
 */
Core.Schemas.Location = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String
  },
  city: {
    type: String,
    index: 1
  },
  country: {
    type: String,
	  index: false
  },
  state: {
	  type: String,
	  optional: true
  },
  address1: {
	  type: String,
    optional: true
  },
  address2: {
	  type: String,
    optional: true
  },
  postal: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    defaultValue: "active",
    optional: true
  },
  selfManaged: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  region: {
    type: String,
    optional: true
  },
  salesArea: {
    type: String,
    autoValue: function () {
      if (!this.isSet){
        let defaultSalesArea = SalesAreas.findOne({ isDefault: true });
        if (defaultSalesArea) return defaultSalesArea.code;
      }
    },
    optional: true
  },
  holdsStock: {
    type: Boolean,
    defaultValue: true
  },
  isWarehouse: {
    type: Boolean,
    defaultValue: true,
    optional: true
  },
  originLocationId: {
    type: String,
    optional: true
  }
});
  
