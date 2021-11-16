/**
 * Staff Categories publications
 */
Meteor.publish("staffcategories", function (businessId) {
    check(businessId, String);
    return StaffCategories.find({businessId: businessId});
    //enhnace this method..
});

/**
 * Staff Category
 */
Core.publish("staffcategory", function (id) {
    return StaffCategories.find({_id: id})
});


/**
 * Staff Category
 */
 Core.publish("specificstaffcategory", function (queries) {
    return StaffCategories.find(queries)
});

