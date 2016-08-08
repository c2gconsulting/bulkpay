//const amqplib = require('amqplib');
import accounting from 'accounting';

Core.LogConnection = Cluster.discoverConnection('log');
LogService = {};

Core.Log.logEvent = function(message, level, userId){
    Core.LogConnection.call("logs/create", message, level, userId, Core.getCurrentTenant(userId))
};


LogService.logCollection = function(collection, options) {
    let collectionName =  options.collectionName;
    let user = {};
    collection.after.insert(function (userId, doc) {
            user.userId = userId || doc.createdBy || doc.userId;
            if (userId && user.userId) {
                let userObj = Meteor.users.findOne(user.userId);
                if (userObj) {
                    user.email = userObj.emails[0].address
                }
            }
        if ((collectionName === "order" || collectionName === "invoice" || collectionName === "returnorder") && doc.assigneeId){
            if (doc.assigneeId){
                let assigneeObj = Meteor.users.findOne(doc.assigneeId);
                if (assigneeObj){
                    user.assigneeId = doc.assigneeId;
                    user.assigneeEmail = assigneeObj.emails[0].address
                }
            }
        }

        let logObject = {
            oldData: {},
            newData: doc,
            collectionName: collectionName,
            docId: doc._id,
            groupId: doc._groupId,
            event: "created",
            user: user
        };

        Meteor.defer(function(){
            publish(logObject)
        })
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
        if ((collectionName === "order" || collectionName === "invoice" || collectionName === "returnorder") && doc.assigneeId){
            if (doc.assigneeId){
                let assigneeObj = Meteor.users.findOne(doc.assigneeId);
                if (assigneeObj){
                    user.assigneeId = doc.assigneeId;
                    user.assigneeEmail = assigneeObj.emails[0].address
                }
            }
        }
        let logObject = {
            oldData: oldDoc,
            newData: doc,
            collectionName: collectionName,
            docId: doc._id,
            groupId: oldDoc._groupId,
            event: "updated",
            user: user
        };
        Meteor.defer(function(){
            publish(logObject)
        })
    });
    collection.after.remove(function (userId, doc) {
            user.userId = userId || doc.createdBy || doc.userId ;
            if (userId && user.userId) {
                let userObj = Meteor.users.findOne(user.userId);
                if (userObj) {
                    user.email = userObj.emails[0].address
                }
            }
        if ((collectionName === "order" || collectionName === "invoice" || collectionName === "returnorder") && doc.assigneeId){
            if (doc.assigneeId){
                let assigneeObj = Meteor.users.findOne(doc.assigneeId);
                if (assigneeObj){
                    user.assigneeId = doc.assigneeId;
                    user.assigneeEmail = assigneeObj.emails[0].address
                }
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
        Meteor.defer(function(){
            publish(logObject)
        })
    });
};

function publish(object){
    const amqplib = Npm.require('amqplib');
    object._id = Random.id();
    const q = 'log.events.in';
    const opts = {
        rejectUnauthorized: false           // set to false
    };
    open = amqplib.connect(process.env.RABBIT_URL, opts);

    open.then(function(conn) {
        let ch = conn.createChannel();
        setTimeout(function() { conn.close(); }, 5000);
        return ch;
    }).then(function(ch) {
        
        ch.on('error', function(err) {
            Core.Log.error(`Channel error: ${err}`);
        });
        
        return ch.assertQueue(q, {durable: true}).then(function(){
            Core.Log.info(`Sending log service event for ${object.collectionName}.${object.event} to ${q}`);
            return ch.sendToQueue(q, new Buffer(JSON.stringify(object)), {persistent: true});
        }).catch(function(err) {
            Core.Log.error(`Error asserting queue: ${err}`);
        });
    }).catch(function(err) {
        Core.Log.error(`Cannot connect to the messaging server: ${err}`);
    });
    
    /*
    amqplib.connect(process.env.RABBIT_URL, function(err, conn) {
        conn.createChannel(function(err, ch) {
            let q = 'log.events.in';
            ch.assertQueue(q, {durable: true});
            ch.sendToQueue(q, new Buffer(JSON.stringify(object)), {persistent: true});
            Core.Log.info(`Log service event for ${object.collectionName}.${object.event} to ${q}`);
        });
        setTimeout(function() { conn.close(); }, 500);
    });
    */


}

LogService.logCollection(Orders, {collectionName: 'order'});
LogService.logCollection(Invoices, {collectionName: 'invoice'});
LogService.logCollection(Products, {collectionName: 'product'});
LogService.logCollection(Customers, {collectionName: 'customer'});
LogService.logCollection(ReturnOrders, {collectionName: 'returnorder'});
LogService.logCollection(Payments, {collectionName: 'payments'});
LogService.logCollection(PromotionRebates, {collectionName: 'promotionrebates'});

