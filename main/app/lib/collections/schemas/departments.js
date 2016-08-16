
/**
 * Order Types Schema
 */
Core.Schemas.Department = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String
    },
    isParent: {
        type: String,
        defaultValue: 'Yes'
    },
    location: {
        type: String
    },
    parent: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    division: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    divisionId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    parentId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    businessId: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    status: {
        type: String,
        defaultValue: "Active"
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
