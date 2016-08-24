/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.Home.events({
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({
    'tenant': function(){
        let tenant = Tenants.findOne();
        return tenant.name;
    }

});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
    //clear BusinessUnit session data
    Session.set('BusinessUnit', null);
});

Template.Home.onRendered(function () {

});

Template.Home.onDestroyed(function () {
});
