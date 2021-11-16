Core.Schemas.Logs = new SimpleSchema({

    event: {
        type: String
    },
    collectionName: {
        type: String
    },
    url: {
        type: String,
        optional: true
    },
    businessId: {
        type: String,
        optional: true
    },
    user: {
        type: Core.Schemas.LogUser,
        blackbox: true
    },
    newData: {
        type: Core.Schemas.Data,
        blackbox: true
    },
    oldData: {
        type: Core.Schemas.Data,
        blackbox: true
    },
    createdAt: {
        type: Date,
        optional: true
    }
})


Core.Schemas.Data = new SimpleSchema({

    name: {
        type: String,
        optional: true
    },
    email: {
        type: String,
        optional: true
    },
})


Core.Schemas.LogUser = new SimpleSchema({
    userId: {
        type: String,
        optional: true
    },
    email: {
        type: String,
        optional: true
    },
})