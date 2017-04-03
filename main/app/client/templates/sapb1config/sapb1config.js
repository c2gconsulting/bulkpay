/*****************************************************************************/
/* sapb1config: Event Handlers */
/*****************************************************************************/

Template.sapb1config.events({
    'click #testConnection': (e,tmpl) => {
        //var view = Blaze.render(Template.Loading, document.getElementById('spinner'));
        
    }
});

/*****************************************************************************/
/* sapb1config: Helpers */
/*****************************************************************************/
Template.sapb1config.helpers({
    'errorMsg': function() {
      return Template.instance().errorMsg.get();
    }
});

/*****************************************************************************/
/* sapb1config: Lifecycle Hooks */
/*****************************************************************************/
Template.sapb1config.onCreated(function () {
    let self = this;

    self.errorMsg = new ReactiveVar();
});

Template.sapb1config.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.sapb1config.onDestroyed(function () {
});
