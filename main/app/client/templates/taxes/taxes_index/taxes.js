/*****************************************************************************/
/* Taxes: Event Handlers */
/*****************************************************************************/
Template.Taxes.events({
    'click #createTax': function(e, tmpl){
        e.preventDefault();
        Modal.show('TaxCreate');
    }
});

/*****************************************************************************/
/* Taxes: Helpers */
/*****************************************************************************/
Template.Taxes.helpers({
    'taxCount': function(){
        return Tax.find().count();
    },
    tax: function(){
        let businessId = Session.get('context')
        return Tax.find({businessId});
    }
});

/*****************************************************************************/
/* Taxes: Lifecycle Hooks */
/*****************************************************************************/
Template.Taxes.onCreated(function () {
    let self = this;
    self.subscribe("taxes", Session.get('context'));
});

Template.Taxes.onRendered(function () {
});

Template.Taxes.onDestroyed(function () {
  Modal.hide('TaxCreate');
});


/*****************************************************************************/
/* Taxes: Helpers */
/*****************************************************************************/
Template.singleTax.helpers({
    activeClass: function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});
Template.singleTax.events({
    'click .pointer': function(e, tmpl){
        this.data.modalHeaderTitle = "Tax Rule Edit";
        Modal.show('TaxCreate', this.data);
    }
})
