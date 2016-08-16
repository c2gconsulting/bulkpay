
/**
 * Order Types Schema
 */
Core.Schemas.Business = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String
  },
   address: {
    type: String
  },
    city: {
    type: String
  },
    state: {
        type: String
    },
    currency: {
        type: Object
    },
    country: {
        type: String
    },
    website: {
        type: String
    },
    isActive: {
        type: Boolean,
        defaultValue: true
    },
    industry: {
        type: String
    },
    contactName: {
        type: String
    },
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    },
    creatorId: {
        type: String
    },
    userId: {
        type: String,
        index: 1,
        autoValue: function () {
            if (this.isInsert) {
                if (this.isSet && Meteor.isServer) {
                    return this.value;
                } else {
                    return this.userId;
                }
            }
        }
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
