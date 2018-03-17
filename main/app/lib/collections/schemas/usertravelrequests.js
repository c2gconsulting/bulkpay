/*usercollection = [
    {

        collectionId: '7457649868408096809',
        hotelId: '7985767698794767698',
        food: {
            breakfast: 0,
            lunch: 20,
            dinner: 5,
            Incidentals: 5,
        },
        depatureDate: '',
        returnDate: ''
    }
]*/
Core.Schemas.UserTravelRequest = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessId: {
        type: String
    },
    travelrequestId:  {
        type: String
    },
    hotelId:  {
            type: String
        },
    food: {
        type: String
    },
    departureDate: {
        type: Date,
        optional: true,
    },
    returnDate: {
        type: Date,
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

    Core.Schemas.Foods = new SimpleSchema({
        Breakfast: {
            type: Number,
            decimal: true,
            optional: true
        },
        Lunch: {
            type: Number,
            decimal: true,
            optional: true
        },
        Dinner: {
            type: Number,
            decimal: true,
            optional: true
        },
        Incidentals: {
            type: Number,
            decimal: true,
            optional: true
       
        }
    });
    