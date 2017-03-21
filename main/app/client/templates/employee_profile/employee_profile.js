/*****************************************************************************/
/* EmployeeProfile: Event Handlers */
/*****************************************************************************/

Template.EmployeeProfile.events({

});

/*****************************************************************************/
/* EmployeeProfile: Helpers */
/*****************************************************************************/
Template.EmployeeProfile.helpers({
    isLoading: function() {
      return EmployeesSearch.getStatus().loading;
    }
});

/*****************************************************************************/
/* EmployeeProfile: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeProfile.onCreated(function () {
    let self = this;
});

Template.EmployeeProfile.onRendered(function () {
});

Template.EmployeeProfile.onDestroyed(function () {
});
