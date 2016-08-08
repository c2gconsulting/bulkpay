
Core.Schemas.WebHook = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    url: {
        type: String,
        regEx: SimpleSchema.RegEx.Url
    },
    name: {
        type: String,
        optional: true
    },
    secretKey: {
        type: String,
        optional: true,
        autoValue: function () {
            if (Meteor.isServer) {
                if (this.isInsert) {
                    return RandToken.generate(32)
                } else if (this.isUpsert) {
                    return {
                        $setOnInsert: RandToken.generate(32)
                    };
                } else {
                    return this.field('secretKey').value
                }
            }
        }
    },
    accessToken: {
        type: String,
        optional: true,
        autoValue: function () {
            if (Meteor.isServer) {
                if (this.isInsert) {
                    return RandToken.generate(16)
                } else if (this.isUpsert) {
                    return {
                        $setOnInsert: RandToken.generate(16)
                    };
                } else {
                    return this.field('accessToken').value
                }
            }
        }
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
        optional: true
    },
    userId: {
        type: String,
        denyUpdate: true,
        optional: true
    }
});

