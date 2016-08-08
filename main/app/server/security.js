/**
 * security definitions
 *
 * The following security definitions use the ongoworks:security package.
 * Rules within a single chain stack with AND relationship. Multiple
 * chains for the same collection stack with OR relationship.
 * See https://github.com/ongoworks/meteor-security
 *
 * It"s important to note that these security rules are for inserts,
 * updates, and removes initiated from untrusted (client) code.
 * Thus there may be other actions that certain roles are allowed to
 * take, but they do not necessarily need to be listed here if the
 * database operation is executed in a server method.
 */


/*
 * Define some additional rule chain methods
 */

Security.defineMethod("ifTenantIdMatches", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return doc.tenantId !== Core.getTenantId(userId);
  }
});

Security.defineMethod("ifTenantIdMatchesThisId", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return doc._id !== Core.getTenantId(userId);
  }
});

Security.defineMethod("ifFileBelongsToTenant", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return doc.metadata.tenantId !== Core.getTenantId(userId);
  }
});

Security.defineMethod("ifUserIdMatches", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return userId && doc.userId && doc.userId !== userId || doc.userId && !userId;
  }
});

Security.defineMethod("ifUserIdMatchesProp", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return doc[arg] !== userId;
  }
});

Security.defineMethod("ifSessionIdMatches", {
  fetch: [],
  deny: function (type, arg, userId, doc) {
    return doc.sessionId !== Core.sessionId;
  }
});

/**
 * Define all security rules
 */

/**
 * admin security
 * Permissive security for users with the "admin" role


Security.permit(["insert", "update", "remove"]).collections([Products, Tags,
  Translations, Discounts, Taxes, Shipping, Orders, Packages
]).ifHasRole({
  role: "admin",
  group: Core.getTenantId()
}).ifTenantIdMatches().exceptProps(["tenantId"]).apply();

/*
 * Permissive security for users with the "admin" role for FS.Collections
 */

/*Security.permit(["insert", "update", "remove"]).collections([Media]).ifHasRole({
 role: ["admin/all", "tenant/maintain", "orders/approve", "orders/manage"],
  group: Core.getTenantId()
}).ifFileBelongsToTenant().apply()*/

Security.permit(['insert', 'update', 'remove']).collections([Media]).ifLoggedIn().apply();

/*
 * Users with the "admin" or "owner" role may update and
 * remove their tenant but may not insert one.
 */

Tenants.permit(["update", "remove"]).ifHasRole({
  role: ["admin", "owner"],
  group: Core.getTenantId()
}).ifTenantIdMatchesThisId().apply();

/*
 * Users with the "admin" or "owner" role may update and
 * remove products, but createProduct allows just for just a product editor


Products.permit(["insert", "update", "remove"]).ifHasRole({
  role: ["createProduct"],
  group: Core.getTenantId()
}).ifShopIdMatchesThisId().apply();

/*
 * Users with the "owner" role may remove orders for their tenant


Orders.permit("remove").ifHasRole({
  role: "owner",
  group: Core.getTenantId()
}).ifShopIdMatches().exceptProps(["tenantId"]).apply();

/*
 * Can update cart from client. Must insert/remove carts using
 * server methods.
 * Can update all session carts if not logged in or user cart if logged in as that user
 * XXX should verify session match, but doesn't seem possible? Might have to move all cart updates to server methods, too?


Cart.permit(["insert", "update", "remove"]).ifHasRole({
  role: ["anonymous", "guest"],
  group: Core.getTenantId()
}).ifShopIdMatchesThisId().ifUserIdMatches().ifSessionIdMatches().apply();

/*
 * apply download permissions to file collections
 */
_.each([Media], function (fsCollection) {
  return fsCollection.allow({
    download: function () {
      return true;
    }
  });
});
