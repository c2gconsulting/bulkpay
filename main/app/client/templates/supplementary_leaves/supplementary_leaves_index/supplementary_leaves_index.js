/*****************************************************************************/
/* SupplementaryLeavesIndex: Event Handlers */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.events({
    'click #createTax': function(e, tmpl){
        e.preventDefault();
        Modal.show('TaxCreate');
    }
});

/*****************************************************************************/
/* SupplementaryLeavesIndex: Helpers */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.helpers({
    'taxCount': function(){
        return Tax.find().count();
    },
    tax: function(){
        return Tax.find();
    }
});

/*****************************************************************************/
/* SupplementaryLeavesIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.onCreated(function () {
    let self = this;
    self.subscribe("taxes", Session.get('context'));
});

Template.SupplementaryLeavesIndex.onRendered(function () {
});

Template.SupplementaryLeavesIndex.onDestroyed(function () {
  Modal.hide('TaxCreate');
});


/*****************************************************************************/
/* singleSupplementaryLeave: Helpers */
/*****************************************************************************/
Template.singleSupplementaryLeave.helpers({
    activeClass: function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});
Template.singleSupplementaryLeave.events({
    'click .pointer': function(e, tmpl){
        this.data.modalHeaderTitle = "Tax Rule Edit";
        Modal.show('TaxCreate', this.data);
    }
})
