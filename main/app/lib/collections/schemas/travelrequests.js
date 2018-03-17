Core.Schemas.TravelRequest = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    stateOneId:  {
        type: String
    },
    stateTwoId:  {
            type: String
        },
    flightCost: {
            type: Number,
            decimal: true,
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
            denyUpdate: true
        }
    });
    