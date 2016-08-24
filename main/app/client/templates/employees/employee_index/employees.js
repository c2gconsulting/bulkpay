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
        return [];
    }
});

/*****************************************************************************/
/* Employees: Lifecycle Hooks */
/*****************************************************************************/
Template.Employees.onCreated(function () {
});

Template.Employees.onRendered(function () {
});

Template.Employees.onDestroyed(function () {
});
