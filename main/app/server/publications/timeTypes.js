
Core.publish("TimeTypes", function (filter, limit, sort) {
    let timeTypeCursor = TimeTypes.find(filter, {sort: sort, limit: limit});
    let timeTypes = timeTypeCursor.fetch();

    if (timeTypes && timeTypes.length > 0){
        return timeTypeCursor;
    }
    return this.ready();
});
