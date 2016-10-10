
/*****************************************************************************/
/* PensionsIndex: Event Handlers */
/*****************************************************************************/
Template.PensionIndex.events({
    'click #newPension': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PensionCreate');
    }
});

/*****************************************************************************/
/* Pensions: Helpers */
/*****************************************************************************/
Template.PensionIndex.helpers({
    'pensions': function(){
        return Pensions.find();
    },
    'pensionCount': function(){
        return Pensions.find().count();
    }
});

/*****************************************************************************/
/* Pensions: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionIndex.onCreated(function () {
    let self = this;
    self.subscribe("pensions", Session.get('context'));
});

Template.PensionIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionIndex ), $('#pensionContext').get(0) );
});

Template.PensionIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* PensionsIndex: Event Handlers */
/*****************************************************************************/
Template.PensionIndex.events({
    'click #newPension': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PensionCreate');
    }
});

/*****************************************************************************/
/* Pensions: Helpers */
/*****************************************************************************/
Template.singlePension.helpers({
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});
Template.singlePension.events({
    'click .pointer': function(e, tmpl){
        Modal.show('PensionCreate', this.data);
    }
})

/*****************************************************************************/
/* Pensions: Lifecycle Hooks */
/*****************************************************************************/
Template.singlePension.onCreated(function () {
    let self = this;
    self.subscribe("pensions", Session.get('context'));
});

Template.singlePension.onRendered(function () {
    //UI.insert( UI.render( Template.PensionIndex ), $('#pensionContext').get(0) );
});

Template.singlePension.onDestroyed(function () {
});
