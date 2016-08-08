

Meteor.methods({
  // method to use for micro-service user validation
  "ddpAuth/getUserByToken": function (loginToken) {
    var hashedToken = loginToken && Accounts._hashLoginToken(loginToken);
    var selector = {'services.resume.loginTokens.hashedToken': hashedToken};
    var options = {fields: {_id: 1}};
    var user = Meteor.users.findOne(selector, options);
    return (user)? user._id : null;
  },
  "ddpAuth/localSearch": function (collection, searchTerm, authProfile) {
    return Core.SearchConnection.call('search/local', collection, searchTerm, authProfile);
  }
});