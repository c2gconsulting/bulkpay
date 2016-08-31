/*****************************************************************************/
/* Paygroups: Event Handlers */
/*****************************************************************************/
Template.Paygroups.events({
    'click #createPaygroup': function(e){
        e.preventDefault();
        Modal.show('PaygroupCreate');
    }
});

/*****************************************************************************/
/* Paygroups: Helpers */
/*****************************************************************************/
Template.Paygroups.helpers({
});

/*****************************************************************************/
/* Paygroups: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygroups.onCreated(function () {
});

Template.Paygroups.onRendered(function () {
});

Template.Paygroups.onDestroyed(function () {
});
