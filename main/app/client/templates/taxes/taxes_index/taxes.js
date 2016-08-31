/*****************************************************************************/
/* Taxes: Event Handlers */
/*****************************************************************************/
Template.Taxes.events({
    'click #createTax': function(e, tmpl){
        e.preventDefault();
        Modal.show('TaxCreate');
    }
});

/*****************************************************************************/
/* Taxes: Helpers */
/*****************************************************************************/
Template.Taxes.helpers({
});

/*****************************************************************************/
/* Taxes: Lifecycle Hooks */
/*****************************************************************************/
Template.Taxes.onCreated(function () {
});

Template.Taxes.onRendered(function () {
});

Template.Taxes.onDestroyed(function () {
});
