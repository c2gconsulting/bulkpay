/**
 * Travel Request publications
 */


 Core.publish("TimeRecordsBySupervisor", function (businessUnitId, supervisorId) {
     return TimeRecord.find({businessId: businessUnitId, supervisorId: supervisorId});
 });


Core.publish("TimeRecordsICreated", function (businessUnitId) {
    let user = this.userId;

    return TimeRecord.find({businessId: businessUnitId, createdBy: this.userId});

});


Meteor.publish("TimeRecord", function (requisitionId) {
    return TimeRecord.find({_id: requisitionId});
});

Core.publish("allTimeRecords", function (businessId) {

    if(businessId) {
        check(businessId, String);
    return TimeRecord.find({businessId: businessId});

    }

    //enhnace this method..
});
