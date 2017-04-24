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
    isProcurementRequisitionActive: {
        type: Boolean
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
