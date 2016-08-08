/**
 * Promotion Parameter Schema
 */
Core.Schemas.ApprovalParamater = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  parameterNameInParentSchema: {
    type: String
  },
  dataType: {
    type: String
  },
  isLookUp: {
    type: Boolean
  },
  lookUpObject: {
    type: String,
    optional: true,
    trim: true
  },
  lookUpField: {
    type: String,
    optional: true,
    trim: true
  },
  friendlyName: {
    type: String,
    optional: true
  }
});

/**
 * Promotion Rule Schema
 */
Core.Schemas.ApprovalRule = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    optional: true,
    type: String
  },
  approvalParameterId: {
    type: String,
    optional: true
  },
  subParamValue: {
    type: String,
    optional: true
  },
  operator: {
    type: String,
    optional: true
  },
  value: {
    type: String|Number,
    optional: true
  }
});


Core.Schemas.Approval = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    index: 1
  },
  documentType: {
    type: [String],
    index: 1
  },
  status: {
    type: String,
    allowedValues: ["active", "pending", "suspended", "ended"],
    defaultValue: "active",
    optional: true
  },
  rules: {
    type: [Core.Schemas.ApprovalRule],
    optional: true
  },
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
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
