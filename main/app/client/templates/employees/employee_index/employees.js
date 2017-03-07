/*****************************************************************************/
/* Employees: Event Handlers */
/*****************************************************************************/
Template.Employees.events({
    'click #createEmployee': (e, tmpl) => {
        e.preventDefault();
        Router.go('employees.create', tmpl.data);

    }
});

/*****************************************************************************/
/* Employees: Helpers */
/*****************************************************************************/
Template.Employees.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    }
});

/*****************************************************************************/
/* Employees: Lifecycle Hooks */
/*****************************************************************************/
Template.Employees.onCreated(function () {
    let self = this;
    self.subscribe("allEmployees", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));
});

Template.Employees.onRendered(function () {
});

Template.Employees.onDestroyed(function () {
});

