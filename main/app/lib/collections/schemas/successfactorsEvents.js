
/**
* SuccessFactorsEvent Schema
*/
Core.Schemas.SuccessFactorsEvent = new SimpleSchema({
  _id: {
      type: String,
      optional: true
  },
  businessId: {
      type: String
  },
  eventBody: {
    type: String,
    optional: true
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
      denyUpdate: true,
      optional: true
  },
  _groupId: {
      type: String,
      optional: true
  },
});
