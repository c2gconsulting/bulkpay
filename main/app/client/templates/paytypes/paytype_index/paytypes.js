/*****************************************************************************/
/* Paytypes: Event Handlers */
/*****************************************************************************/
Template.Paytypes.events({
    'click #createPaytype': function(e){
        e.preventDefault();
        Modal.show('PaytypeCreate');
    }
});

/*****************************************************************************/
/* Paytypes: Helpers */
/*****************************************************************************/
Template.Paytypes.helpers({
});

/*****************************************************************************/
/* Paytypes: Lifecycle Hooks */
/*****************************************************************************/
Template.Paytypes.onCreated(function () {
});

Template.Paytypes.onRendered(function () {
});

Template.Paytypes.onDestroyed(function () {
});
