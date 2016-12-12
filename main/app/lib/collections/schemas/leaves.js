
/**
 * Leave Types Schema
 */


Core.Schemas.LeaveType = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    name: {
        type: String,
        optional: true
    },
    positionIds: {
        type: [String],
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female', 'All'],
        optional: true
    },
    payGradeId: {
        type: String,
        optional: true
    },
    maximumDuration: {
        type: String,
        optional: true
    },
    businessId: {
        type: String,
        autoValue: function () {
            return BusinessUnits.findOne()._id
        }
    },
    status: {
        type: String,
        defaultValue: 'Active',
        allowedValues: ['Active', 'Inactive'],
        optional: true
    },
    notAllowedOn: {
        type: [String],
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

})

Core.Schemas.Leave = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    startDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    endDate: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    duration: {
        type: Number,
        autoform: {
            readonly: true
        },
        autoValue:function(){
            let startDate = this.field("startDate").value;
            let endDate = this.field("endDate").value;
            if (startDate && endDate){
                startDate = moment(startDate);
                endDate = moment(endDate);
                var duration = endDate.diff(startDate, 'days');
                console.log(duration)
                return duration;
            }
        },
        optional: true
    },
    type: {
        type: String,
        optional: true
    },
    description: {
        type: String,
        optional: true
    },
    businessId: {
        type: String,
        autoValue: function () {
            return BusinessUnits.findOne()._id
        }
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
        },
        optional: true,
        denyUpdate: true
    },
    approvalStatus: {
        type: String,
        defaultValue: 'Pending',
        optional: true
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Draft',
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
