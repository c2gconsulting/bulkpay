
/**
 * StaffCategories Types Schema
 */
 Core.Schemas.StaffCategory = new SimpleSchema({
    _id: {
      type: String,
      optional: true
    },
    businessId: {
      type: String
    },
    position: {
      type: String,
      optional: true
    },
    category: {
      type: String
    },
    name: {
      type: String
    },
    perdiem: {
      type: Number
    },
    mealDailyRate: {
      type: Number
    },
    hotelDailyRate: {
      type: Number
    },
    groundTransport: {
      type: Number
    },
    airportPickupDropOffCost: {
      type: Number
    },
    currency: {
      type: String,
      defaultValue: 'NGN',
      allowedValues: ['NGN', 'USD'],
    },
    isInternational: {
      type: Boolean,
      defaultValue: false
    },
    notificationEmail: {
      type: String,
      optional: true
    },
    status: {
      type: String,
      defaultValue: "Active",
      allowedValues: ["Active","Inactive"],
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
      optional: true,
      denyUpdate: true
    }
});
