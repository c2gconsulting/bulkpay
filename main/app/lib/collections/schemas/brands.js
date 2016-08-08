/**
 * Location Schema
 * locations represent depots, plants or warehouses
 */
Core.Schemas.Brand = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String
  },
  originBrandId: {
    type: String,
    optional: true,
    denyUpdate: true
  }
});
  
