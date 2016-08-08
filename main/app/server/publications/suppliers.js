/**
 * suppliers
 */

Core.publish("Suppliers", function () {
    return Suppliers.find({})
});

/**
 * supplier
 */

Core.publish("Supplier", function (id) {
    return Suppliers.find({_id: id})
});