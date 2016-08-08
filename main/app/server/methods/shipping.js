/*
 * Core Shipping Methods
 * methods typically used for checkout (shipping, taxes, etc)
 */
Meteor.methods({
  /**
   * shipping/updateShipmentQuotes
   * @summary gets shipping rates and updates the users cart methods
   * @todo add orderId argument/fallback
   * @param {String} cartId - cartId
   * @return {undefined}
   */
  "shipping/updateShipmentQuotes": function (cartId) {
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    if (!cartId) {
      return [];
    }
    check(cartId, String);
    this.unblock();
    let cart = Cart.findOne(cartId);
    if (cart) {
      let rates = Meteor.call("shipping/getShippingRates", cart);
      // no rates found
      if (!rates) {
        return [];
      }
      let selector;
      let update;
      // temp hack until we build out multiple shipment handlers
      // if we have an existing item update it, otherwise add to set.
      if (cart.shipping && rates.length > 0) {
        selector = {
          "_id": cartId,
          "shipping._id": cart.shipping[0]._id
        };
        update = {
          $set: {
            "shipping.$.shipmentQuotes": rates
          }
        };
      } else {
        selector = {
          _id: cartId
        };
        update = {
          $push: {
            shipping: {
              shipmentQuotes: rates
            }
          }
        };
      }
      // add quotes to the cart
      if (rates.length > 0) {
        Cart.update(selector, update, function (error) {
          if (error) {
            Core.Log.warn('Error adding rates to cart ${cartId}', error);
            return;
          }
          Core.Log.debug('Success adding rates to cart ${cartId}', rates);
        });
      }
    }
  },

  /**
   * shipping/getShippingRates
   * @summary just gets rates, without updating anything
   * @param {Object} cart - cart object
   * @return {Array} return updated rates in cart
   */
  "shipping/getShippingRates": function (cart) {
    check(cart, Object);
    if (!this.userId) {
      throw new Meteor.Error(401, "Unauthorized");
    }
    let rates = [];
    let tenants = [];
    let products = cart.items;
    // default selector is current tenant
    let selector = {
      tenantId: Core.getTenantId(Meteor.userId())
    };
    // must have products to calculate shipping
    if (!cart.items) {
      return [];
    }
    // create an array of tenants, allowing
    // the cart to have products from multiple tenants
    for (let product of products) {
      if (product.tenantId) {
        tenants.push(product.tenantId);
      }
    }
    // if we have multiple tenants in cart
    if ((tenants !== null ? tenants.length : void 0) > 0) {
      selector = {
        tenantId: {
          $in: tenants
        }
      };
    }

    let shippingMethods = Shipping.find(selector);

    shippingMethods.forEach(function (shipping) {
      let _results = [];
      for (let method of shipping.methods) {
        if (!(method.enabled === true)) {
          continue;
        }
        if (!method.rate) {
          method.rate = 0;
        }
        if (!method.handling) {
          method.handling = 0;
        }
        rate = method.rate + method.handling;
        _results.push(rates.push({
          carrier: shipping.provider.label,
          method: method,
          rate: rate,
          tenantId: shipping.tenantId
        }));
      }
      return _results;
    });
    Core.Log.info("getShippingrates returning rates");
    Core.Log.debug("rates", rates);
    return rates;
  }
});
