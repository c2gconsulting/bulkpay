/*****************************************************************************/
/* Oneoff: Event Handlers */
/*****************************************************************************/
Template.Oneoff.events({
    'click #newOneOff': function(e){
        e.preventDefault();
        console.log('clicked one off');
        Modal.show('OneoffCreate');
    }
});

/*****************************************************************************/
/* Oneoff: Helpers */
/*****************************************************************************/
Template.Oneoff.helpers({
});

/*****************************************************************************/
/* Oneoff: Lifecycle Hooks */
/*****************************************************************************/
Template.Oneoff.onCreated(function () {
});

Template.Oneoff.onRendered(function () {
});

Template.Oneoff.onDestroyed(function () {
});
