/*****************************************************************************/
/* Paygrades: Event Handlers */
/*****************************************************************************/
Template.Paygrades.events({
    'click #createPaygrade': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Paygrades: Helpers */
/*****************************************************************************/
Template.Paygrades.helpers({
    fixed: (paytype) => {
        return paytype.derivative == "Fixed"
    }
});

/*****************************************************************************/
/* Paygrades: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygrades.onCreated(function () {
    let self = this;
});

Template.Paygrades.onRendered(function () {

});

Template.Paygrades.onDestroyed(function () {
});
