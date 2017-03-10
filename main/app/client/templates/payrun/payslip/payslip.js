/*****************************************************************************/
/* Payslip: Event Handlers */
/*****************************************************************************/
Template.Payslip.events({

});

/*****************************************************************************/
/* Payslip: Helpers */
/*****************************************************************************/
Template.Payslip.helpers({
    'currency': () => {
        return Core.getTenantBaseCurrency().iso;

    }

});

/*****************************************************************************/
/* Payslip: Lifecycle Hooks */
/*****************************************************************************/
Template.Payslip.onCreated(function () {
    let self = this;

});

Template.Payslip.onRendered(function () {
    console.log(Template.instance().data);

});

Template.Payslip.onDestroyed(function () {

});
