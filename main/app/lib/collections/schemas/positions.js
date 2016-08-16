
/**
 * Position Types Schema
 */
Core.Schemas.Position = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
    positionNumber: {
        type: Number,
        index: 1,
        autoValue: Core.schemaPositionNextSeqNumber,
        optional: true, // to enable pre-validation
        denyUpdate: true
    },
    name: {
        type: String
    },
    businessId: {
        type: String
    },
    businessUnitId: {
        type: String
    },
    divisionId: {
        type: String
    },
    departmentId: {
        type: String
    },
    parentPositionId: {
        type: String
    },
    headingSection: {
        type: String
    },
    headingSectionId: {
        type: String
    },
    leave: {
        type: [Object]
    },
    leaveDays: {
        type: Number,
        defaultValue: 35
    },
    numberOfAllowedEmployees: {
        type: Number,
        defaultValue: 1
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
