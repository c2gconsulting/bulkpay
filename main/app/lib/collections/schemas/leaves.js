
/**
 * Order Types Schema
 */
Core.Schemas.Leave = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    duration: {
        type: Number
    },
    type: {
        type: String
    },
    description: {
        type: String
    },
    businessId: {
        type: String
    },
    employeeId: {
        type: String
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Pending'
    },
    employee : {
        type: String,
        regEx: SimpleSchema.RegEx.Id
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
