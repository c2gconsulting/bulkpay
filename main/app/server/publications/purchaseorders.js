/**
 * orders
 */

Core.publish("PurchaseOrders", function (filter, limit, sort) {
    let fields = {
        'customerId': 1,
        'customerNumber': 1,
        'customerName': 1,
        'contactEmail': 1,
        'contactPhone': 1,
        'userId': 1,
        'approvalStatus': 1,
        'status': 1,
        'purchaseOrderNumber': 1,
        'orderNumber': 1,
        'issuedAt': 1,
        'shipAt': 1,
        'createdAt': 1,
        'subtotal': 1,
        'total': 1,
        'orderType': 1,
        'isPickup': 1,
        'taxRate': 1,
        'shippingStatus': 1,
        'supplierName': 1,
        'currency': 1,
        'billingAddressId': 1,
        'shippingAddressId': 1,
        'priceListCode': 1,
        'reference': 1,
        'paymentStatus': 1,
        'items': 1
    };

    return PurchaseOrders.find(filter,{
        fields: fields, sort: sort, limit: limit
    });

});


Core.publish("PurchaseOrder", function(id){
    return PurchaseOrders.find({ _id: id });
})