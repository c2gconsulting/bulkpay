
/**
 * Order Types Schema
 */
Core.Schemas.Expense = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    from: {
        type: Date
    },
    to: {
        type: Date
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
    amount: {
        type: Number
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Pending'
    },
    attachments: {
        type: Object
    },
    serviced: {
        type: Boolean,
        defaultValue: false
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
