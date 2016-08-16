
/**
 * Order Types Schema
 */
Core.Schemas.BusinessUnit = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaBusinessUnitNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
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
