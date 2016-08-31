/*****************************************************************************/
/* Positions: Event Handlers */
/*****************************************************************************/
Template.Positions.events({
    'click #createPositon': function(e, tmpl){
        e.preventDefault();
        Modal.show('PositionCreate');
    }
});

/*****************************************************************************/
/* Positions: Helpers */
/*****************************************************************************/
Template.Positions.helpers({
});

/*****************************************************************************/
/* Positions: Lifecycle Hooks */
/*****************************************************************************/
Template.Positions.onCreated(function () {
});

Template.Positions.onRendered(function () {
});

Template.Positions.onDestroyed(function () {
});
