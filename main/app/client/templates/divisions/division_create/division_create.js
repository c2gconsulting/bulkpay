/*****************************************************************************/
/* DivisionCreate: Event Handlers */
/*****************************************************************************/
Template.DivisionCreate.events({
    'click #savedivision': function(event){
        event.preventDefault();
        console.log('clicked save division');

    },
    'click [name=isParent]': function(e,tmpl){
        console.log(tmpl);
    }
});

/*****************************************************************************/
/* DivisionCreate: Helpers */
/*****************************************************************************/
Template.DivisionCreate.helpers({
    'division': () => {return Divisions.find()}
});

/*****************************************************************************/
/* DivisionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.DivisionCreate.onCreated(function () {
});

Template.DivisionCreate.onRendered(function () {
});

Template.DivisionCreate.onDestroyed(function () {
});
