/*****************************************************************************/
/* SupplementaryLeavesIndex: Event Handlers */
/*****************************************************************************/
Template.SupplementaryLeavesIndex.events({
    'click #createLeaveBalance': function(e, tmpl){
        e.preventDefault();
        Modal.show('SupplementaryLeaveCreate');
    },
    'click #uploadLeaveBalance': function(e, tmpl){
        e.preventDefault();
        Modal.show('ImportSupplementaryLeavesModal');
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
    $("html, body").animate({ scrollTop: 0 }, "slow");
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
    },
    getUserFullName: function(userId) {
        let user = Meteor.users.findOne(userId)
        return user.profile.fullName || ''
    }
});
Template.singleSupplementaryLeave.events({
    'click .pointer': function(e, tmpl){
        this.data.modalHeaderTitle = "Leave Balance Edit";
        Modal.show('SupplementaryLeaveCreate', this.data);
    }
})
