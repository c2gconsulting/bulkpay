/*****************************************************************************/
/* EntityCreate: Event Handlers */
/*****************************************************************************/
Template.EntityCreate.events({
    'click #createEntity': (e, tmpl) => {
        console.log("entity created");
    }
});

/*****************************************************************************/
/* EntityCreate: Helpers */
/*****************************************************************************/
Template.EntityCreate.helpers({
    'disabled': function(){
        //checks form and enable button when all is complete
        let condition = false;
        if(condition)
            return "disabled";
        return "";
    }
});

/*****************************************************************************/
/* EntityCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.EntityCreate.onCreated(function () {
});

Template.EntityCreate.onRendered(function () {
    console.log(this.data);
});

Template.EntityCreate.onDestroyed(function () {
});
