/*****************************************************************************/
/* Departments: Event Handlers */
/*****************************************************************************/
Template.Departments.events({
    'click #createDepartment': function(e){
        e.preventDefault();
        console.log('yaah');
        Modal.show('DivisionCreate');
    }
});

/*****************************************************************************/
/* Departments: Helpers */
/*****************************************************************************/
Template.Departments.helpers({
});

/*****************************************************************************/
/* Departments: Lifecycle Hooks */
/*****************************************************************************/
Template.Departments.onCreated(function () {
});

Template.Departments.onRendered(function () {
});

Template.Departments.onDestroyed(function () {
});
