
/**
 * Look at the below link to understand more how search works
 * https://github.com/meteorhacks/search-source
 * 
 * meteor add meteorhacks:search-source
 * Running the above command will add the Meteor package needed
 * for the below code to work
 */

SearchSource.defineSource('users', function(searchText, options) {
  let queryOptions = {
    sort: {isoScore: -1}, 
    limit: 20
  };

  if(searchText && options && options.businessId) {
    var regExp = buildRegExp(searchText);
    var selector = {
      $and: [
        {businessIds: options.businessId}, 
        {$or: [
          {
            "profile.fullName": regExp
          },
          {
            "profile.firstname": regExp
          },
          {
            "profile.lastname": regExp
          }
        ]}
      ]};

    return Meteor.users.find(selector, queryOptions).fetch();
  } 
  // else {
  //   return Meteor.users.find({}, queryOptions).fetch();
  // }
});

SearchSource.defineSource('paytypes', function(searchText, options) {
  let queryOptions = {
    sort: {isoScore: -1}, 
    limit: 20
  };

  if(searchText && options && options.businessId) {
    var regExp = buildRegExp(searchText);
    var selector = {
      $and: [
        {businessId: options.businessId}, 
        {$or: [
          {
            "code": regExp
          },
          {
            "title": regExp
          }, 
          {
            "type": regExp
          }
        ]}
      ]};

    return PayTypes.find(selector, queryOptions).fetch();
  } 
  // else {
  //   return PayTypes.find({}, queryOptions).fetch();
  // }
});

function buildRegExp(searchText) {
  // this is a dumb implementation
  var parts = searchText.trim().split(/[ \-\:]+/);
  return new RegExp("(" + parts.join('|') + ")", "ig");
}
