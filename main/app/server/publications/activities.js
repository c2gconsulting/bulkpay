/**
 * Activities publications
 */

Core.publish("activities", function (type, projectOrUnitId) {
    check(type, String);
    check(projectOrUnitId, String);

    return Activities.find({type: type, unitOrProjectId: projectOrUnitId});
});
