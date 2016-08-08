/**
 *  Order Methods
 */
Meteor.methods({

    /**
     * purchaseorders/create
     * @summary when we create a new purchase order attach all the necessary fields
     * @param {Object} doc - optional purchaseOrder object
     * @return {String} return insert result
     */

    "purchaseorders/create": function (doc) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        let userId = Meteor.userId();

        try {
            check(doc, Core.Schemas.PurchaseOrder);
        } catch (e) {
            throw new Meteor.Error(401, "There's invalid data in your order. Please correct and retry");
        }

        let purchaseOrderId = PurchaseOrders.insert(doc);
        let newOrder = PurchaseOrders.findOne(purchaseOrderId);
        return {_id: purchaseOrderId, purchaseOrderNumber: newOrder.purchaseOrderNumber};
    },

    /**
     * purchaseorders/receive
     * @summary when we create a new purchase order attach all the necessary fields
     * @param {Object} id -  purchaseOrder ID
     * @param {Array} items -  purchaseOrder items
     * @return {String} return insert result
     */

    "purchaseorders/receive": function (doc) {
        let userId = Meteor.userId();
        check(doc, Core.Schemas.GoodsReceivedNote);
        this.unblock();
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
            let purchaseOrder = PurchaseOrders.findOne({purchaseOrderNumber: doc.purchaseOrderNumber});

            if (purchaseOrder) {
                let oItems = purchaseOrder.items;
                let iItems = doc.items;

                let newItems = [];
                let receivedItems = [];
                let updatedItems = [];

                _.each (iItems, function (iItem) {
                    _.reduce(_.filter(oItems, function (el) {
                        return el._id === iItem.orderItemId && el.status === "open";
                    }), function (remQty, o2) {
                        let rem = 0;
                        if (remQty > 0) {
                            rem = remQty < o2.quantity ? 0 : remQty - o2.quantity;
                            if (remQty < o2.quantity) {
                                let newItem = _.extend({}, o2);
                                newItem.quantity = o2.quantity - remQty;
                                delete newItem._id;
                                newItems.push(newItem);
                                _.extend(o2, {quantity: remQty, status: "received"});
                                updatedItems.push(o2);
                            } else {
                                o2.status = "received";
                                updatedItems.push(o2)
                            }
                            let receivedItem = _.extend({}, iItem);
                            receivedItem.quantity = o2.quantity;
                            receivedItem.orderItemId = o2._id;
                            receivedItem.price = o2.price;
                            receivedItem.discount = o2.discount || 0;
                            receivedItem.uom = o2.uom;
                            receivedItem.taxRateOverride = o2.taxRateOverride || 0;
                            receivedItem.isPromo = o2.isPromo;
                            receivedItems.push(receivedItem)
                        }
                        return rem;
                    }, iItem.quantity);
                });

                doc.items = receivedItems;
                doc.taxRate = purchaseOrder.taxRate;

                if (receivedItems.length > 0) {
                    _.each(receivedItems, function (r) {
                        let variant = ProductVariants.findOne(r.variantId);
                        if (variant) {
                            let variantLocation = _.findWhere(variant.locations, {locationId: purchaseOrder.shippingAddressId});
                            if (variantLocation) {
                                let currentStock = variantLocation.stockOnHand || 0;
                                currentStock += r.quantity;
                                ProductVariants.update({_id: variant._id, "locations.locationId": purchaseOrder.shippingAddressId},
                                    {
                                        "$set": {
                                            'locations.$.stockOnHand': currentStock
                                        }
                                    });
                            }
                        }
                    });
                    
                    if (updatedItems.length > 0) {
                        _.each(updatedItems, function( item ) {
                            PurchaseOrders.update({_id: purchaseOrder._id, "items._id": item._id},
                                {
                                    "$set": {
                                        'items.$.status': item.status,
                                        'items.$.quantity': item.quantity
                                    }
                                })
                        })
                    }
                    if (newItems.length > 0) {
                        PurchaseOrders.update({_id: purchaseOrder._id}, {$addToSet: {items: {$each: newItems}}});
                    }
                    return true
                } else {
                    throw new Meteor.Error(403, "There are no items to receive. It could be these items have already been received.");
                }

            } else {
                throw new Meteor.Error(403, "Purchase Order not found");
            }
    },

    "purchaseorders/update": function (id, purchaseOrder, userId) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(purchaseOrder, Core.Schemas.PurchaseOrder);
        userId = userId || Meteor.userId();
        delete purchaseOrder._id;
        delete purchaseOrder.purchaseOrderNumber;
        delete purchaseOrder.userId;
        delete purchaseOrder.createdAt;
        delete purchaseOrder.paymentStatus;

        let pOrder = PurchaseOrders.findOne(id);
        let updateStatus =  PurchaseOrders.update({_id: id}, {$set: purchaseOrder});
        return PurchaseOrders.findOne(id)
    },

    /**
     * purchaseorders/addNote
     * @summary adds purchaseOrder note to purchaseOrder
     * @param {String} id - add note to id
     * @param {String} message - Note body
     * @return {String} returns order update result
     */
    "purchaseorders/addNote": function (id, message) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        check(id, String);
        check(message, String);
        let purchaseOrder = PurchaseOrders.findOne(id);
        if (purchaseOrder){
            let updateStatus = PurchaseOrders.update(id, {
                $addToSet: {
                    notes: {
                        body: message,
                        userId: Meteor.userId(),
                        createdAt: new Date()
                    }
                }
            });
            return true
        } else  throw new Meteor.Error(401, "Unauthorized");
    }
});
