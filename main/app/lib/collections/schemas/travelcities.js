
/**
* TravelCity Schema
*/
Core.Schemas.TravelCity = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  businessId: {
    type: String
  },
  name: {
    type: String
  },
  perdiem: {
    type: Number
  },
  currency: {
    type: String,
    defaultValue: 'NGN',
    allowedValues: ['NGN', 'USD'],
  },
  status: {
    type: String,
    optional: true,
    defaultValue: "Active"
  },
  createdAt: {
    type: Date,
    optional: true,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    denyUpdate: true
  }
});
