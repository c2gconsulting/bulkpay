

/**
 * userProfile
 * get any user name and profile
 * should be limited, secure information
 * users with permissions  ["owner", "admin"]
 * may view the profileUserId"s profile data.
 *
 * @params {String} profileUserId -  view this users profile when permitted
 */

Core.publish("UserProfile", function (profileUserId) {
  check(profileUserId, Match.OneOf(String, null));
  const permissions = ["owner", "admin"];

  if (profileUserId !== this.userId && Roles.userIsInRole(this.userId, permissions, Roles.GLOBAL_GROUP)) {
    return Meteor.users.find({
      _id: profileUserId
    }, {
      fields: {
        "emails": true,
        "profile.firstName": true,
        "profile.lastName": true,
        "profile.familyName": true,
        "profile.secondName": true,
        "profile.name": true
      }
    });
  } else if (this.userId) {
    return Meteor.users.find({
      _id: this.userId
    });
  }
  return [];
});
