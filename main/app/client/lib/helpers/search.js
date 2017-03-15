/**
 * Look at the below link to understand more how search works
 * https://github.com/meteorhacks/search-source
 * 
 * meteor add meteorhacks:search-source
 * Running the above command will add the Meteor package needed
 * for the below code to work
 */

var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var employeeSearchFields = ['profile.fullName', 'profile.firstname', 'profile.lastname'];
EmployeesSearch = new SearchSource('users', employeeSearchFields, options);

//--
var payTypesSearchFields = ['code', 'title', 'type'];
PayTypesSearch = new SearchSource('paytypes', payTypesSearchFields, options);
