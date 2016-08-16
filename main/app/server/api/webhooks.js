WebHookService = {};


WebHookService.sendEvent = function(collection, options) {
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
            doc  = enrichDoc(doc)
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
        
        let event = logObject.event;
        Meteor.defer(function() {
            if (logObject.groupId){
                Meteor.call("webhooks/sendRequest", doc, {}, event, collectionName, logObject.user, logObject.groupId);
                if (doc.status  && doc.status === "accepted"){
                    Meteor.call("webhooks/sendRequest", doc, {}, "accepted", collectionName, logObject.user, logObject.groupId);
                }
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
        if ((collectionName === "order" || collectionName === "invoice" || collectionName === "returnorder") && doc.assigneeId){
            if (doc.assigneeId){
                let assigneeObj = Meteor.users.findOne(doc.assigneeId);
                if (assigneeObj){
                    user.assigneeId = doc.assigneeId;
                    user.assigneeEmail = assigneeObj.emails[0].address
                }
            }
            doc  = enrichDoc(doc)
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
        let event = logObject.event;

        if (collectionName === "order" && doc.status === "accepted" && oldDoc.status !== "accepted"){
            event = "accepted"
        }

        if (collectionName === "order" && doc.status === "cancelled" && oldDoc.status !== "cancelled"){
            event = "cancelled"
        }

        Meteor.defer(function() {
            Meteor.call("webhooks/sendRequest", doc, oldDoc, event, collectionName, logObject.user, logObject.groupId);
        });
    });
};


//WebHookService.sendEvent(Orders, {collectionName: 'order'});
//WebHookService.sendEvent(Invoices, {collectionName: 'invoice'});
//WebHookService.sendEvent(ReturnOrders, {collectionName: 'returnorder'});
//WebHookService.sendEvent(Payments, {collectionName: 'payments'});
//WebHookService.sendEvent(PromotionRebates, {collectionName: 'promotionrebates'});

function enrichDoc(doc){
    let variantIds = _.pluck(doc.items, "variantId");
    let productVariants = ProductVariants.find({_id: {$in: variantIds}}, {fields: {name: 1}}).fetch();
    let variantData = {};


    function getVariant(variantId) {
        if (!variantId) return "";
        return variantData[variantId] ? variantData[variantId].name : ""
    }

    _.each(productVariants, function (variant) {
        variantData[variant._id] = {
            name: variant.name
        };
    });
    _.each(doc.items, function(i){
        i.name = getVariant(i.variantId)
    });
    return doc
}
