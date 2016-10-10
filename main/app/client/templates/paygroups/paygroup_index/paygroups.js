/*****************************************************************************/
/* Paygroups: Event Handlers */
/*****************************************************************************/
Template.Paygroups.events({
    'click #createPaygroup': function(e){
        e.preventDefault();
        Modal.show('PaygroupCreate');
    }
});

/*****************************************************************************/
/* Paygroups: Helpers */
/*****************************************************************************/
Template.Paygroups.helpers({
    payGroup(){
        return PayGroups.find();
    }
});

/*****************************************************************************/
/* Paygroups: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygroups.onCreated(function () {
    let self = this;
    self.subscribe("payGroups", Session.get('context'));
});

Template.Paygroups.onRendered(function () {
});

Template.Paygroups.onDestroyed(function () {
});
