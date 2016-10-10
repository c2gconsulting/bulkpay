/*****************************************************************************/
/* Paytypes: Event Handlers */
/*****************************************************************************/
Template.Paytypes.events({
    'click #createPaytype': function(e){
        e.preventDefault();
        Modal.show('PaytypeCreate');
    }
});

/*****************************************************************************/
/* Paytypes: Helpers */
/*****************************************************************************/
Template.Paytypes.helpers({
    'paytypes': function(){
        return PayTypes.find();
    },
    'paytypeCount': function(){
        return PayTypes.find().count();
    }
});

/*****************************************************************************/
/* Paytypes: Lifecycle Hooks */
/*****************************************************************************/
Template.Paytypes.onCreated(function () {
    let self = this;
    self.subscribe("PayTypes", Session.get('context'));
});

Template.Paytypes.onRendered(function () {
});

Template.Paytypes.onDestroyed(function () {
});


/**********************************************************************/
/* Single Paytype helper */
/******************************************************************* */

Template.singlePaytype.helpers({
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});

Template.singlePaytype.events({
    'click .pointer': function(e, tmpl){
        Modal.show('PaytypeCreate', this.data);
    }
});