
/**
* SuccessFactorsIntegrationConfig Schema
*/
Core.Schemas.SuccessFactorsIntegrationConfig = new SimpleSchema({
  _id: {
      type: String,
      optional: true
  },
  businessId: {
      type: String
  },
  protocol: {
    type: String
  },
  odataDataCenterUrl : {
      type: String,
      optional: true
  },
  companyId : {
      type: String
  },
  username : {
      type: String
  },
  password : {
      type: String
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
  }
});
