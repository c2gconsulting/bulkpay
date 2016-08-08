/**
 * cart
 *

Meteor.publish("Carts", function (sessionId, userId) {
  check(sessionId, Match.OneOf(String, null));
  check(userId, Match.OptionalOrNull(String));
  // sessionId is required, not for selecting
  // the cart, (userId), but as a key in merging
  // anonymous user carts into authenticated existing
  // user carts.
  // we won't create carts unless we've got sessionId
  if (!this.userId || sessionId === null) {
    this.ready();
  }
  // tenantId is also required.
  if (!Core.getTenantId()) {
    this.ready();
  }
  // select user cart
  cart = cart.findOne({
    userId: this.userId
  });

  // we may create a cart if we didn't find one.
  if (cart) {
    cartId = cart._id;
  } else if (this.userId) {
    cartId = Meteor.call("cart/createCart", this.userId);
  } else {
    this.ready();
  }
  // return cart cursor
  return Carts.find(cartId);
});*/

/**
 * shipment
 */

Core.publish("Shipments", function () {
  return Shipments.find({
  });
});


