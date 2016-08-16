
/**
 * History and Activity Types Schema
 */
Core.Schemas.History = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    oldValue: {
        type: String
    },
    newValue: {
        type: String
    },
    referenceId: {
        type: String
    },
    referenceKey: {
        type: String
    },
    event: {
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
    denyUpdate: true
  }
});


Core.Schemas.History = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    objectId: {
        type: String
    },
    date: {
        type: Date,
        defaultValue: new Date
    },
    activities: {
        type: Core.Schemas.Activity
    },
    userId: {
        type: String
    },
    user : {
        type: String,
        regEx: SimpleSchema.RegEx.Id
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