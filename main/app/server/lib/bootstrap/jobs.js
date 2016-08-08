webHookJobs = JobCollection('webhooksjobs');
webHookJobs.allow({
    // Grant full permission to any authenticated user
    admin: function (userId, method, params) {
        return (userId ? true : true);
    }
});


Job.processJobs('webhooksjobs', 'triggerWebHook',
function (job, cb) {
  let jobObject = job.data;
  HTTP.call('POST', jobObject.url,
     {
        data: jobObject.body,
        headers: jobObject.header,
        npmRequestOptions: {"rejectUnauthorized": false}
     }, function(err, res) {
        if(err) {
            job.log("Sending failed with error" + err,
                {level: 'warning'});
            Meteor.defer(function() {
              Core.Log.error(`Error sending to webhook ERROR ${jobObject.url} for ${jobObject.body.type} ${jobObject.body.id} ${err}`)
            });
            job.fail("" + err);
        } else {
            Meteor.defer(function() {
              Core.Log.info(`Sending to webhook ${jobObject.url} successful for ${jobObject.body.type} ${jobObject.body.id}`)
            });
            job.done();
        }
    cb();
 });
});