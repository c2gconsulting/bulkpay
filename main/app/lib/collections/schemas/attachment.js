
/**
* Attachments  Schema
*/
Core.Schemas.Attachment = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    travelId: {
        type: String,
        optional: true,
    },
    owner: {
        type: String,
        optional: true,
    },
    userId: {
        type: String,
        optional: true,
    },
    name: {
        type: String,
        optional: true,
    },
    fileUrl: {
        type: String,
        optional: true,
    },
    imageUrl: {
        type: String,
        optional: true,
    },
    thumbnailUrl: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        optional: true,
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
