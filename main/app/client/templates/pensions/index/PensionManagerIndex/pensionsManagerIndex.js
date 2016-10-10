/*****************************************************************************/
/* PensionsIndex: Event Handlers */
/*****************************************************************************/
Template.PensionManagerIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PensionManagerCreate');
    }
});

/*****************************************************************************/
/* Pensions: Helpers */
/*****************************************************************************/
Template.PensionManagerIndex.helpers({
    'pfas': function(){
        return PensionManagers.find();
    },
    'pfaCount': function(){
        return PensionManagers.find().count();
    }

});

/*****************************************************************************/
/* Pensions: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionManagerIndex.onCreated(function () {
    let self = this;
    self.subscribe("PensionManagers", Session.get('context'));
});

Template.PensionManagerIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.PensionManagerIndex.onDestroyed(function () {
});
