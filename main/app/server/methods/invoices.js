
Meteor.methods({
    /**
     * invoices/addNote
     * @summary adds order note to order
     * @param {String} invoiceId - add note to orderId
     * @param {String} message - Note body
     * @return {String} returns order update result
     */
    "invoices/addNote": function (invoiceId, message) {
        check(invoiceId, String);
        check(message, String);
        return Invoices.update(invoiceId, {
            $addToSet: {
                notes: {
                    body: message,
                    userId: Meteor.userId(),
                    createdAt: new Date()
                }
            }
        });
    },
    "invoices/create": function (doc) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }
        this.unblock();
        let userId = Meteor.userId();
        let invoice;
        if (Core.hasInvoiceAccess(userId, doc.salesLocationId)) {
            Core.createInvoice(doc, userId, function(err, res){
              if (err){
                  throw new Meteor.Error(403, err)
              } else {
                  invoice = res
              }
            });
            return invoice;
        } else {
          throw new Meteor.Error(403, "You are not authorized to create an invoice for this location");
        }
    },

    "invoices/getExportData": function (options) {
        if (!this.userId) {
            throw new Meteor.Error(401, "Unauthorized");
        }

        check(options, Object);
        this.unblock();
        let invoices = Invoices.find(options).fetch();

        let userIds = _.pluck(invoices, "userId");
        let salesLocationIds = _.uniq(_.pluck(invoices, "salesLocationId"));
        let stockLocationIds = _.uniq(_.pluck(invoices, "stockLocationId"));
        let locationIds = _.union(salesLocationIds, stockLocationIds);

        let locationsData = {};
        let data = [];
        let userData = {};

        let users = Meteor.users.find({_id: {$in: userIds}}).fetch();

        _.each(users, function (user) {
            userData[user._id] = {
                username: user.username,
                email: user.emails[0].address,
                assigneeCode: user.salesProfile ? user.salesProfile.originCode : "",
                fullName: user.profile.fullName
            };
        });


        let locations = Locations.find({_id: {$in: locationIds}}).fetch();


        _.each(locations, function (location) {
            locationsData[location._id] = {
                name: location.name
            };
        });

        function getUser(userId) {
            if (!userId) return "";
            return userData[userId] ? userData[userId].fullName : "";
        }

        function getLocation(locationId) {
            if (!locationId) return "Unspecified";
            return locationsData[locationId] ? locationsData[locationId].name : "Unspecified"
        }

        _.each(invoices, function (invoice) {
            data.push([
                invoice.invoiceNumber,
                invoice.orderNumber,
                getLocation(invoice.salesLocationId),
                getLocation(invoice.stockLocationId),
                invoice.issuedAt,
                invoice.total,
                invoice.status,
                invoice.customerName,
                getUser(invoice.userId)
            ]);
        });

        return data
    }
});


_.extend(Core, {
    createInvoice: function(doc, userId, callback){
        let user = Meteor.users.findOne(userId);
        if (user){
            let order = Orders.findOne({orderNumber: doc.orderNumber});
            if (order){
                let oItems = order.items;
                let invoiceItems = doc.items;
                
                let iItems = [];
                let groupedItems =  _.groupBy(invoiceItems, function(el) { 
                    let key = el.variantId + String(!!el.isPromo ? 1 : 0) + String(el.discount ? el.discount : 0);
                    return key

                });
                let variantKeys = _.keys(groupedItems);

               
                _.each(variantKeys, function(v) {
                    iItems.push (_.reduce(groupedItems[v], function (el1, el2) {
                        console.log('el1', el1);
                        console.log('el2', el2);
                        return _.extend(el2, {quantity: el1.quantity + el2.quantity})
                    }));
                });

                let newItems = [];
                let invItems = [];
                let updatedItems = [];

                _.each (iItems, function(iItem) {
                    _.reduce(_.filter(oItems, function(el) {
                        let iItemDiscount = _.isNumber(iItem.discount) && !_.isNaN(iItem.discount) ? iItem.discount : 0;
                        let elDiscount = _.isNumber(el.discount) && !_.isNaN(el.discount) ? el.discount : 0;

                        let promoCheck = !_.isBoolean(iItem.isPromo) ? true : iItem.isPromo === el.isPromo;
                        let discountCheck = _.isUndefined(iItem.discount) ? true : iItemDiscount === elDiscount;

                        return el.variantId === iItem.variantId && promoCheck && discountCheck && el.status==="open"; 
                        }), function(remQty, o2) {
                        let rem = 0;
                        if (remQty > 0) {
                            rem = remQty < o2.quantity ? 0 : remQty - o2.quantity;
                            if (remQty < o2.quantity) {
                                let newItem = _.extend({}, o2);
                                newItem.quantity = o2.quantity - remQty;
                                delete newItem._id;
                                newItems.push(newItem);
                                _.extend(o2, {quantity: remQty, status: "shipped"});
                                updatedItems.push(o2);
                            } else {
                                o2.status = "shipped";
                                updatedItems.push(o2);
                            }
                            let invItem = _.extend({}, iItem);
                            invItem.quantity = o2.quantity;
                            invItem.orderItemId = o2._id;
                            invItem.isPromo = o2.isPromo;
                            invItem.price =  o2.price;
                            invItem.discount = o2.discount || 0;
                            invItem.uom = o2.uom;
                            invItem.taxRateOverride = o2.taxRateOverride || 0;
                            invItems.push(invItem)
                        }
                        return rem;}, iItem.quantity);
                });

                doc.items = invItems;
                doc.createdBy = userId;
                if (invItems.length > 0) {
                    let invoiceId = Invoices.insert(doc);
                    if (invoiceId){
                        let shippingDoc = prepareShipment(doc, order);
                        let shipmentId = Shipments.insert(shippingDoc);
                    } else {
                       return callback("Cannot create invoice", null);
                    }
                    if (updatedItems.length > 0) {
                        _.each(updatedItems, function( item ) {
                            Orders.update({_id: order._id, "items._id": item._id},
                                {
                                    "$set": {
                                        'items.$.status': item.status,
                                        'items.$.quantity': item.quantity
                                    }
                                })
                        })
                    }
                    if (newItems.length > 0){
                        Orders.update({_id: order._id}, {$addToSet: {items: {$each: newItems}}});
                    }
                    let newInvoice = Invoices.findOne(invoiceId);
                    sendInvoiceNotification("invoice.created", newInvoice, userId);
                    return callback(null,  { _id: invoiceId, invoiceNumber: newInvoice.invoiceNumber });
                } else {
                    return callback("There are no items to invoice. It could be that these items have already been invoiced.", null);
                }
            } else {
               return callback("Order not found", null);
            }
        } else {
            return callback("Unauthorized", null);
        }
    }
});



function prepareShipment(invoice, order) {
    let shipment = {};
    let items = invoice.items;
    delete items["isPromo"];
    delete items["discount"];
    delete items["taxRateOverride"];
    shipment.orderId = order._id;
    shipment.shippedAt = invoice.shipAt;
    shipment.isPickup = order.isPickup;
    shipment.items = items;
    shipment.shippingAddressId = order.shippingAddressId;
    shipment.billingAddressId = order.billingAddressId;
    return shipment

}

function sendInvoiceNotification(event, invoice, user){
    Meteor.defer(function(){
        let nObject = {};
        nObject.event = event;
        nObject.userId = user;
        nObject.objectId = invoice._id;
        nObject.groupId = invoice._groupId;
        Meteor.call("notifications/sendNotification", nObject);
    });
}




