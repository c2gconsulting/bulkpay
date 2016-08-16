
/**
 * PensionManager Types Schema
 */
Core.Schemas.PensionManager = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
    businessId: {
        type: String
    },
    code: {
        type: String
    },
    name: {
        type: String
    },
    status: {
        type: String,
        defaultValue: "Active"
    },
    accountDetails: {
        type: Object
    },
  createdAt: {
    type: Date,
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
