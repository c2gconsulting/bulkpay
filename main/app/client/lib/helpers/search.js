var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var employeeSearchFields = ['profile.fullName', 'profile.firstname', 'profile.lastname'];
EmployeesSearch = new SearchSource('users', employeeSearchFields, options);

//--
var payTypesSearchFields = ['code', 'title', 'type'];
PayTypesSearch = new SearchSource('paytypes', payTypesSearchFields, options);
