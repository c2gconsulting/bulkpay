
Core.Schemas.TimeWriting = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    employeeId: {
        type: String,
        index: 1,
        autoform: {
            type: "hidden",
            label: false
        },
        autoValue: function() {
            if (this.isInsert) {
                if (this.isSet && Meteor.isServer) {
                    return this.value;
                } else {
                    return this.userId;
                }
            }
        }
    },
    businessId: {
        type: String
    },
    project: {
        type: String,
        optional: true
    },
    activity:{
        type: String,
        optional: true,
        custom: function () {
            let employeeId = this.siblingField("employeeId").value;
            let duration = this.siblingField("duration").value;
            let activity = this.siblingField("activity").value;

            if(activity) {
                let dayAsDate = this.siblingField("day").value;

                var dayStart = moment(dayAsDate).startOf('day').toDate();
                var dayEnd = moment(dayAsDate).endOf('day').toDate();
    
                return TimeWritings.find({
                    activity: activity,
                    employeeId: employeeId,
                    day: {
                        $gte: dayStart,
                        $lt: dayEnd
                    }
                }).count() > 0 ? "duplicateActivityOnSameDayNotAllowed" : true
            }
        }
    },
    costCenter: {
        type: String,
        optional: true
    },
    day: {
        type: Date
    },
    duration: {
        type: Number
    },
    note: {
        type: String,
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Open',
        allowedValues: ['Approved', 'Open', "Rejected"],
        optional: true
    },
    isStatusSeenByCreator: {
        type: Boolean,
        defaultValue: false
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    approvedDate: {
        type: Date,
        optional: true
    },
    isApprovalStatusSeenByCreator: {
        type: Boolean,
        defaultValue: false
    },
    "successFactorsCostCenter": {
        type: String,
        optional: true,
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

SimpleSchema.messages({
    "duplicateActivityOnSameDayNotAllowed": "You cannot record time for same activity twice in one day",
});
