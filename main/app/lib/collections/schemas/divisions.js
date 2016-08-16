
/**
 * Order Types Schema
 */
Core.Schemas.Division = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String
    },
    parentId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    parentName: {
        type: String
        // use autoValue to populate parent name
    },
    location: {
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
