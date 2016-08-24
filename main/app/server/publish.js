
Meteor.publish('divisions', function () {
  return Divisions.find();
});

Meteor.publish('departments', function () {
  return Departments.find();
});

Meteor.publish('positions', function () {
  return Positions.find();
});

Meteor.publish('jobs', function () {
  return Jobs.find();
});

Meteor.publish('paygroups', function () {
  return Paygroups.find();
});

Meteor.publish('paytypes', function () {
  return Paytypes.find();
});

Meteor.publish('paygrades', function () {
  return Paygrades.find();
});

Meteor.publish('taxes', function () {
  return Taxes.find();
});

Meteor.publish('pensions', function () {
  return Pensions.find();
});

Meteor.publish('employees', function () {
  return Employees.find();
});
