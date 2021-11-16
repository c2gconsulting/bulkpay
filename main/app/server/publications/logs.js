/**
 * Logs
 */

Core.publish("Logs", function (filter, limit, sort) {
    return Logs.find(filter, limit, sort);
});
