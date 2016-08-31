/*****************************************************************************/
/* Paygrades: Event Handlers */
/*****************************************************************************/
Template.Paygrades.events({
    'click #createPaygrade': (e, tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Paygrades: Helpers */
/*****************************************************************************/
Template.Paygrades.helpers({
});

/*****************************************************************************/
/* Paygrades: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygrades.onCreated(function () {
});

Template.Paygrades.onRendered(function () {
});

Template.Paygrades.onDestroyed(function () {
});
