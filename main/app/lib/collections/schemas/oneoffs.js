
/**
 * Order Types Schema
 */
Core.Schemas.OneOff = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  employee : {
        type: String,
        regEx: SimpleSchema.RegEx.Id
  },
    payment: {
        type: Object
    },
    description: {
        type: String
    },
    id: {
        type: String
    },
    customTitle: {
        type: String
    },
    businessId: {
        type: String
    },
    serviced: {
        type: String,
        defaultValue: 'No'
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
