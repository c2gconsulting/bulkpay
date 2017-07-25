/*****************************************************************************/
/* SupplementaryLeavesIndex: Event Handlers */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.events({
    'click #createTax': function(e, tmpl){
        e.preventDefault();
        Modal.show('SupplementaryLeaveCreate');
    }
});

/*****************************************************************************/
/* SupplementaryLeavesIndex: Helpers */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.helpers({
    'taxCount': function(){
        return SupplementaryLeaves.find().count();
    },
    tax: function(){
        return SupplementaryLeaves.find();
    }
});

/*****************************************************************************/
/* SupplementaryLeavesIndex: Lifecycle Hooks */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.onCreated(function () {
    let self = this;
    self.subscribe("supplementaryLeaves", Session.get('context'));
});

Template.SupplementaryLeavesIndex.onRendered(function () {
});

Template.SupplementaryLeavesIndex.onDestroyed(function () {
  Modal.hide('SupplementaryLeaveCreate');
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
        this.data.modalHeaderTitle = "Leave Balance Edit";
        Modal.show('SupplementaryLeaveCreate', this.data);
    }
})
