/**
 * entity Objects publications
 */

Core.publish("getChildrenEntityObject", function (parent) {
    //perform neccessary checks and return both parent and children
    return EntityObjects.find({$or: [{parentId: parent}, {_id: parent}]});
});

/**
 * Business units
 */

Core.publish("getRootEntities", function (bu) {
    //perform neccessary checks
    return EntityObjects.find({parentId: null, businessId: bu});
});