
/**
 * TimeTrack Types Schema
 */
Core.Schemas.TimeTrack = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
    projectId: {
        type: String
    },
    activityId: {
        type: String
    },
    duration: {
        type: Number
    },
    description: {
        type: String
    },
    employeeId: {
        type :String
    },
    employee : {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    businessId: {
        type: String
    },
    date: {
        type: Date
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Pending'
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    status: {
        type: String,
        defaultValue: 'Draft'
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
