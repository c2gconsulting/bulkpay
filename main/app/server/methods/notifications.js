/**
 *  Notification Api Methods
 */
Meteor.methods({
    "notifications/sendNotification": function (object){
        const amqplib = Npm.require('amqplib');
        object._id = Random.id();
        const q = 'notification.events.in';
        const opts = {
            rejectUnauthorized: false           // set to false
        };

        open = amqplib.connect(process.env.RABBIT_URL, opts);

        open.then(function(conn) {
            ch = conn.createChannel();
            setTimeout(function() { conn.close(); }, 500);
            return ch;
        }).then(function(ch) {

            ch.on('error', function(err) {
                Core.Log.error(`Channel error: ${err}`);
            });

            return ch.assertQueue(q, {durable: true}).then(function(){
                Core.Log.info(`Sending notification service event for ${object.event} to ${q}`);
                return ch.sendToQueue(q, new Buffer(JSON.stringify(object)), {persistent: true});
            }).catch(function(err) {
                Core.Log.error(`Error asserting queue: ${err}`);
            });
        }).catch(function(err) {
            Core.Log.error(`Cannot connect to the messaging server: ${err}`);
        });
    }
});