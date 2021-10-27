import accounting from 'accounting';

Core.LogConnection = null//Cluster.discoverConnection('log');
LogService = {};

Core.Log.logEvent = function(message, level, userId){
    Core.LogConnection.call("logs/create", message, level, userId, Core.getCurrentTenant(userId))
};


LogService.logCollection = function(collection, options) {
    let collectionName =  options.collectionName;
    let url = options.url;
    let user = {};
    collection.after.insert(function (userId, doc) {
            user.userId = userId || doc.createdBy || doc.userId;
            if (userId && user.userId) {
                let userObj = Meteor.users.findOne(user.userId);
                if (userObj) {
                    user.email = userObj.emails[0].address
                }
            }

            console.log('logCollection', JSON.stringify(doc))

        let logObject = {
            oldData: {},
            newData: doc,
            collectionName: collectionName,
            docId: doc._id,
            groupId: doc._groupId,
            event: "created",
            user: user,
            url: url? `/business/${doc.businessId}${url}${doc._id}` : undefined
        };

        Meteor.call('logs/createLog', logObject, function(err){
            if (err){
                console.log(err)
            } else{

            }
        });
    });
    collection.after.update(function (userId, doc) {
        let oldDoc = this.previous;

            user.userId = userId || doc.createdBy || doc.userId;
            if (userId && user.userId) {
                let userObj = Meteor.users.findOne(user.userId);
                if (userObj) {
                    user.email = userObj.emails[0].address
                }
            }
        let logObject = {
            oldData: oldDoc,
            newData: doc,
            collectionName: collectionName,
            docId: doc._id,
            groupId: oldDoc._groupId,
            event: "updated",
            user: user,
            url: url? `/business/${doc.businessId}${url}${doc._id}` : undefined            
        };

        Meteor.call('logs/createLog', logObject, function(err){
            if (err){
                console.log(err)
            } else{

            }
        });

    });
    collection.after.remove(function (userId, doc) {
            user.userId = userId || doc.createdBy || doc.userId ;
            if (userId && user.userId) {
                let userObj = Meteor.users.findOne(user.userId);
                if (userObj) {
                    user.email = userObj.emails[0].address
                }
            }

        let logObject = {
            oldData: doc,
            newData: {},
            collectionName: collectionName,
            docId: doc._id,
            groupId: doc._groupId,
            event: "deleted",
            user: user
        };

        Meteor.call('logs/createLog', logObject, function(err){
            if (err){
                console.log(err)
            } else{

            }
        });
    });
};



LogService.logCollection(TravelRequisition2s, {collectionName: 'travelrequisition2s', url: '/travelrequests2/printrequisition?requisitionId='});
LogService.logCollection(BusinessUnits, {collectionName: 'businessunits'});
// LogService.logCollection(IntegrationUsers, {collectionName: 'integrationusers'});
// LogService.logCollection(Settings, {collectionName: 'settings'});
// LogService.logCollection(BillPaymentTransactions, {collectionName: 'billpaymenttransactions'});
// LogService.logCollection(Disputes, {collectionName: 'disputes', url: '/disputes'});
// LogService.logCollection(VatTransactions, {collectionName: 'vattransactions', url: '/transaction/details'});
// LogService.logCollection(WhtTransactions, {collectionNae: 'whttransactions', url: '/transaction/details'});
// LogService.logCollection(Form002Uploads, {collectionName: 'Form-002', url: '/form002/view'});









