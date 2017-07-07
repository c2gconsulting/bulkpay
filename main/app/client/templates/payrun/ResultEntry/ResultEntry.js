/*****************************************************************************/
/* ResultEntry: Event Handlers */
/*****************************************************************************/
import Ladda from "ladda";

Template.ResultEntry.events({
    'click #PayGroupButton': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#PayGroupButton')[0]);
        l.start();
    },
    'click .payslip': (e, tmpl) => {
        // console.log("what i'm sending to payslip is ", JSON.stringify(tmpl.data.payslip));

        let payLoadForPayslip = {
            payslip: tmpl.data.payslip,
            payslipWithCurrencyDelineation: tmpl.data.payslipWithCurrencyDelineation
        }

        Modal.show('Payslip', payLoadForPayslip);
    },
    'click .log': (e, tmpl) => {
        Modal.show('Log', tmpl.data.log);
    }
});

/*****************************************************************************/
/* ResultEntry: Helpers */
/*****************************************************************************/
Template.ResultEntry.helpers({
    getlineColor: (status) => {
        return status? 'error': 'success';
    }

});

/*****************************************************************************/
/* ResultEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.ResultEntry.onCreated(function () {

});

Template.ResultEntry.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.ResultEntry.onDestroyed(function () {
});
