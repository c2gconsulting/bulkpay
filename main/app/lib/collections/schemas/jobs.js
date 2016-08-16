
/**
 * Order Types Schema
 */
Core.Schemas.Job = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },code: {
        type: String,
    },
    title: {
        type: String
    },

    role: {
        type: String
    },
    positionId: {
        type: String
    },
    position : {
        type: String
    },
    description: {
        type: String
    },
    businessId: {
        type: String
    },
    status: {
        type: String,
        defaultValue: 'Active'
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

