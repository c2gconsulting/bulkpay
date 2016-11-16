/**
 * entity Objects publications
 */

Core.publish("getChildrenEntityObject", function (parent) {
    //perform neccessary checks and return both parent and children
    return EntityObjects.find({$or: [{parentId: parent}, {_id: parent}]});
});

/**
 * Entity
 */

Core.publish("getRootEntities", function (bu) {
    //perform neccessary checks
    return EntityObjects.find({parentId: null, businessId: bu});
});

Core.publish("getEntity", function (id) {
    //perform neccessary checks
    return EntityObjects.find({_id: id});
});
