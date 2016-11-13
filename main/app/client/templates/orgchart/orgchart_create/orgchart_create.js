/*****************************************************************************/
/* DivisionCreate: Event Handlers */
/*****************************************************************************/
Template.OrgChartCreate.events({
    'click #saveEntity': function(event){
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
Template.OrgChartCreate.helpers({
    'entities': () => {return EntityObjects.find()}
});

/*****************************************************************************/
/* DivisionCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.OrgChartCreate.onCreated(function () {
});

Template.OrgChartCreate.onRendered(function () {
});

Template.OrgChartCreate.onDestroyed(function () {
});
