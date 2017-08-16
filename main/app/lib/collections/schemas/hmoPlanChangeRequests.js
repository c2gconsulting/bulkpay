Core.Schemas.HmoPlanChangeRequest = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    }, 
    // type: {
    //     type: String,
    //     custom: function () {
    //         if (Meteor.isClient && this.isSet) {
    //             let selectedType = this.value;
    //             let duration = parseInt(this.siblingField("duration").value);
    //             let selectedQuota = parseInt(LeaveTypes.findOne({_id: selectedType}).maximumDuration);

    //             if(duration > selectedQuota){
    //                 Core.Schemas.Leave.namedContext('leavesForm').addInvalidKeys([{name: "type", type: "ExceededDays" }]);
    //             }
    //         }
    //     }

    // },
    hmoPlanType: {
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
        type: String
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
        defaultValue: 'Open',
        allowedValues: ['Open', 'Approved', 'Rejected'],
        optional: true
    },
    approvedBy: {
        type: String,
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    isApprovalStatusSeenByCreator: {
        type: Boolean,
        defaultValue: false
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