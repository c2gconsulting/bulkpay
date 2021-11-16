/**
 * Activities publications
 */

Core.publish("activities", function (type, projectOrUnitId) {
    check(type, String);
    check(projectOrUnitId, String);

    console.log('activities subscription')

    return Activities.find({type: type, unitOrProjectId: projectOrUnitId});
});


Core.publish("activity", function (id) {
    return Activities.find({ _id: id});
});

Core.publish("AllActivities", function (businessId) {
    return Activities.find({businessId: businessId});
});
