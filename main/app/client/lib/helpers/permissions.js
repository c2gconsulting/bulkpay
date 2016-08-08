/*
 * Methods for the reaction permissions
 * https://github.com/ongoworks/reaction#rolespermissions-system
 * use: {{hasPermissions admin userId}}
 */

/**
 * hasPermission template helper
 * @summary check current user hasPermission
 * @param  {String|Array} "permissions"
 * @param  {String} checkUserId - optional Meteor.userId, default to current
 * @return {Boolean}
 */
Template.registerHelper("hasPermission", function (permissions, options) {
  check(permissions, Match.OneOf(String, Array));
  check(options.hash, Match.Optional(Object));
  // default to checking this.userId
  let userId = Meteor.userId();
  // we don't necessarily need to check here
  // as these same checks and defaults are
  // also performed in Core.hasPermission
  if (typeof options === "object") {
    if (options.hash.userId) {
      userId = options.hash.userId;
      return Core.hasPermission(permissions, userId);
    }
  }
  return Core.hasPermission(permissions, userId);
});

/**
 * hasOwnerAccess template helper
 * @summary check if user has owner access
 * @return {Boolean} return true if owner
 */
Template.registerHelper("hasOwnerAccess", function () {
  // default to checking this.userId
  let userId = Meteor.userId();
  return Core.hasOwnerAccess(userId);
});

/**
 * hasAdminAccess template helper
 * @summary check if user has admin access
 * @return {Boolean} return true if admin
 */
Template.registerHelper("hasAdminAccess", function () {
  // default to checking this.userId
  let userId = Meteor.userId();
  return Core.hasAdminAccess(userId);
});

/**
 * hasOrderAccess template helper
 * @summary check if user has order access
 * @return {Boolean} return true if user has order permission
 */
Template.registerHelper("hasOrderAccess", function (group) {
  return Core.hasOrderAccess(Meteor.userId(), group);
});
