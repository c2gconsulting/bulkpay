SearchSource.defineSource('users', function(searchText, options) {
  var options = {sort: {isoScore: -1}, limit: 20};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {$or: [{
        "profile.fullName": regExp
      },{
        "profile.firstname": regExp
      }, {
        "profile.lastname": regExp
      }
    ]};

    let usersFoundForSearch = Meteor.users.find(selector, options).fetch();
    console.log("Num usersFoundForSearch: " + usersFoundForSearch.length);

    return usersFoundForSearch
  } else {
    return Meteor.users.find({}, options).fetch();
  }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}

console.log("server side search.js")
