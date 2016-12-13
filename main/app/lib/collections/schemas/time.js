
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
    duration: {
        type: Number,
        autoform: {
            readonly: true
        },
        autoValue:function(){
            let startDate = this.field("startTime").value;
            let endDate = this.field("endTime").value;
            if (startDate && endDate){
                startDate = moment(startDate);
                endDate = moment(endDate);
                var duration = moment.utc(startDate.diff(endDate)).format("HH:mm:ss");
                return duration;
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
                return duration;
            }
        },
        optional: true
    },
    type: {
        type: String,
        custom: function () {
            if (Meteor.isClient && this.isSet) {
                let selectedType = this.value;
                let duration = parseInt(this.siblingField("duration").value);
                let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);
                console.log(selectedQuota);
                if(duration > selectedQuota){
                    console.log("got here");
                    Core.Schemas.Leave.namedContext('leavesForm').addInvalidKeys([{name: "type", type: "ExceededDays" }]);
                }
                //Meteor.call("accountsIsUsernameAvailable", this.value, function (error, result) {
                //    if (!result) {
                //        Meteor.users.simpleSchema().namedContext("createUserForm").addInvalidKeys([{name: "username", type: "notUnique"}]);
                //    }
                //});
            }
        }

    },
    description: {
        type: String,
        optional: true
    },
    approvedBy: {
        type: String,
        optional: true
    },
    approvedDate: {
        type: Date,
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
        allowedValues: ['Pending', 'Approved', 'Rejected'],
        optional: true
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
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
