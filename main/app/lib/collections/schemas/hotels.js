
/**
 * PensionManager Types Schema
 */
Core.Schemas.Hotel = new SimpleSchema({
    _id: {
      type: String,
      optional: true
    },
    businessId: {
        type: String
    },
    stateId: {
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
          optional: true,
          defaultValue: "Active"
      },
      accountDetails: {
          type: Object,
          optional: true
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
  