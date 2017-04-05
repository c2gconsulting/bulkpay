

Core.Schemas.SapUnitConfig = new SimpleSchema({
    unitId : {
        type: String
    },
    costCenterAccountCode : {
        type: String
    }
});
Core.Schemas.SapProjectConfig = new SimpleSchema({
    projectId : {
        type: String
    },
    projectAccountCode : {
        type: String
    }
});
Core.Schemas.SapPayTypeConfig = new SimpleSchema({
    payTypeId : {
        type: String
    },
    payTypeDebitAccountCode : {
        type: String
    },
    payTypeCreditAccountCode : {
        type: String
    }
});

/**
 * SapBusinessUnitConfig Schema
 */
Core.Schemas.SapBusinessUnitConfig = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    businessUnitId: {
        type: String
    },
    sapCompanyCode : {
        type: String
    },
    ipAddress : {
        type: String
    },
    protocol: {
        type: String
    },
    companyDatabaseName : {
        type: String
    },
    units: {
        type: [Core.Schemas.SapUnitConfig],
        optional: true
    },
    projects: {
        type: [Core.Schemas.SapProjectConfig],
        optional: true
    },
    payTypes: {
        type: [Core.Schemas.SapPayTypeConfig]
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
        denyUpdate: true,
        optional: true
    }
});
