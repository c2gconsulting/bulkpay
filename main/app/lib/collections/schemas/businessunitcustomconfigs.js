/**
 * Created by eariaroo on 4/24/17.
 */

/**
 * BusinessUnitCustomConfig Schema
 */
Core.Schemas.BusinessUnitCustomConfig = new SimpleSchema({
    _id: {
        type: String
    },
    businessId: {
        type: String
    },
    payGradeLabel: {
        type: String
    },
    payGradeLabelPlural: {
        type: String
    },
    isHourLeaveRequestsEnabled: {
        type: Boolean        
    },
    isProcurementRequisitionActive: {
        type: Boolean
    },
    isTravelRequisitionActive: {
        type: Boolean
    },
    procurementRequisitionApprovalConfig: {
        type: Object
    },
    isTwoStepApprovalEnabled: {
        type: Boolean
    },
    leaveDaysAccrual: {
        type: String // 'FixedLeaveEntitlement' or 'NumberOfDaysWorked'
    },
    checkEmployeeResumptionForPayroll: {
        type: Boolean
    },
    isWeekendIncludedInLeaveRequests: {
        type: Boolean
    },
    isTimeTypeEnabled: {
        type: Boolean,
        optional: true
    },
    isHmoSetupEnabled: {
        type: Boolean,
        optional: true
    },
    baseColor: {
        type: String,
        optional: true
    },
    displayLogoInSideBar: {
        type: Boolean,
        optional: true
    },
    isEmployeePersonalDataEditableByEmployee: {
        type: Boolean,
        optional: true
    },
    extraPersonalDataEmployeeProfileFieldsSupported: {
        type: [String],
        optional: true
    },
    isRelieverEnabledForLeaveRequests: {
        type: Boolean,
        optional: true
    },
    isEmployeePromotionEnabled: {
        type: Boolean,
        optional: true
    },
    isActive: {
        type: Boolean
    },
    _groupId: {
        type: String
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
