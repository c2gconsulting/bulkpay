
/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.EmployeeEditEmploymentPayrollModal.events({

});

/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Helpers */
/*****************************************************************************/
Template.EmployeeEditEmploymentPayrollModal.helpers({
    'response': () => {
        return Session.get("response")
    },
    'error': () => {
        return Template.instance().response.get('error');
    }
});

/*****************************************************************************/
/* EmployeeEditEmploymentPayrollModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEditEmploymentPayrollModal.onCreated(function () {
    let self = this;

    console.log("Employee edit modal. parent data: " + Template.parentData());


    self.response = new ReactiveDict();
    Session.set("response", undefined);
});

Template.EmployeeEditEmploymentPayrollModal.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.EmployeeEditEmploymentPayrollModal.onDestroyed(function () {
});
