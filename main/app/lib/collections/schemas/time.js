
/**
 * Leave Types Schema
 */


Core.Schemas.Time = new SimpleSchema({
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
        type: String,
        autoValue: function () {
            return BusinessUnits.findOne()._id
        }
    },
    project: {
        type: String
    },
    activity:{
        type: String
    },
    costCenter: {
        type: String,
        optional: true
    },
    note: {
        type: String,
        optional: true
    },
    startTime: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    endTime: {
        type: Date,
        autoform: {
            afFieldInput: {
                class: 'calendar datepicker',
                type: "bootstrap-datetimepicker"
            }
        }
    },
    includeBreak: {
        type: Boolean,
        defaultValue: true
    },
    duration: {
        type: Number,
        autoform: {
            readonly: true
        },
        autoValue:function(){
            const startTime = this.field("startTime").value;
            const endTime = this.field("endTime").value;
            console.log('loggin field value as ', this.field("includeBreak").value );
            const breakflag = this.field('includeBreak').value == true? 1 : 0;
            if (startTime && endTime){
                start = moment(startTime);
                end = moment(endTime);
                const duration = moment.duration(end.diff(start));
                let hours = duration.asHours();
                if (breakflag)
                    hours -= 1;
                return hours;
            }
        },
        optional: true
    },
    status: {
        type: String,
        defaultValue: 'Open',
        allowedValues: ['Approved', 'Open', "Rejected"],
        optional: true
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