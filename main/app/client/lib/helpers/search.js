var options = {
  keepHistory: 1000 * 60 * 5,
  localSearch: true
};
var fields = ['profile.fullName', 'profile.firstname', 'profile.lastname'];

EmployeesSearch = new SearchSource('users', fields, options);
console.log("Client side - search");
