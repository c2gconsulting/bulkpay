/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/
import createHmac from 'crypto';


Meteor.methods({
    'webhooks/create': function (doc, userId) {
        check(doc, Object);
        doc.userId = userId;
        check(doc, Core.Schemas.WebHook);
        this.unblock();
            let webHook = WebHooks.insert(doc);
            if (webHook) {
                return {status: "successfully created webhook", id: webHook}
            } else {
                throw new Meteor.Error(500, "Could not create webhook")
            }

    },

    'webhooks/get': function (userId, options) {
        this.unblock();
            let webHook = WebHooks.find({}, options).fetch();
            return webHook
    },

    'webhooks/update': function (doc, docId, userId, group) {
        check(doc, Core.Schemas.WebHook);
        this.unblock();
           let webHook = WebHooks.findOne(docId);
           if (webHook) {
              let webhookId = WebHooks.update(docId, {$set: doc});
              if (webhookId){
                  return {status: "Successfully updated webhook"}
              } else {
                  return {status: "Failed to update webhook"}
              }
           } else {
               throw new Meteor.Error(404, "Not found")
           }

    },

    'webhooks/regenerateKeys': function (docId, userId) {
        check(docId, String);
        this.unblock();
            let webHook = WebHooks.findOne(docId);
            if (webHook) {
                let webhookId = WebHooks.update(docId,
                    {$set: {
                        secretKey: RandToken.generate(32),
                        accessToken: RandToken.generate(16)
                    }
                    });
                if (webhookId){
                    return {status: "Successfully generated keys"}
                } else {
                    return {status: "Failed to generate keys"}
                }
            } else {
                throw new Meteor.Error(404, "Not found")
            }

    },

    'webhooks/delete': function (docId, userId) {
        check(docId, String);
        this.unblock();
        let webHook = WebHooks.remove(docId);
        if (webHook) {
            return {status: "Successfully removed webhook"}
        } else {
            throw new Meteor.Error(404, "Could not delete webhook")
        }
    },

    'webhooks/sendRequest': function (requestDoc, previousDoc, event, collectionName, user, group) {
        if (group){
            this.unblock();
            requestDoc.user = user.email || user.userId;
            delete requestDoc.userId;
            if (user.assigneeEmail){
                requestDoc.assignee = user.assigneeEmail;
                delete requestDoc.assigneeId;
            }
            let doc = {
                id: requestDoc._id,
                object: "event",
                api_version: "V1",
                created: Math.floor(Date.now() / 1000), // unix date
                data: {
                    object: requestDoc,
                    previous_attributes: event === "created" ? {} : previousDoc
                },
                request: null,
                type: lowerCase(collectionName) + "." + event
            };

            Partitioner.bindGroup(group, function () {
                let webHooks = WebHooks.find().fetch();
                _.each(webHooks, function(webHook) {
                    let reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
                    let splitPath = reg.exec( webHook.url );
                    let urlPath = splitPath ? reg.exec( webHook.url )[1] : "";
                    let stringBody = JSON.stringify(doc);
                    let md5Body = CryptoJS.MD5(stringBody).toString();
                    let base64Body = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(md5Body));
                    let currentTime = (new Date()).toISOString();
                    let stringToSign = "" +
                        "POST" + "\n" +
                        base64Body + "\n" +
                        "application/json" + "\n" +
                        "x-timestamp:" + currentTime + "\n" +
                        urlPath;
                    let signature = createHmac.createHmac('sha256', webHook.secretKey)
                        .update(stringToSign)
                        .digest('base64');
                    let authorization = "Application" + " " + webHook.accessToken + ":" + signature;
                    let job = new Job(webHookJobs, 'triggerWebHook',
                        {
                            url: webHook.url,
                            body: doc,
                            userId: user.userId,
                            group: group,
                            header: {"content-type": "application/json", "x-timestamp": currentTime, "authorization": authorization}
                        });
                    job.priority('normal')
                        .retry({ retries: 72,
                            wait: 60*60*1000 })
                        .delay(1000)
                        .save();
                });
            });
        }
    }
});

function lowerCase(str){
    let string = str.replace(/[_-]/g, " ");
    return string.toLowerCase();
}