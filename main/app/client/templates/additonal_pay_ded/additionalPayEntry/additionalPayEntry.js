/*****************************************************************************/
/* AdditionalPayEntry: Event Handlers */
/*****************************************************************************/
Template.AdditionalPayEntry.events({
    'click #newAddPay': function(e){
        e.preventDefault();
        Modal.show('AdditionalPayEntryCreate');
    },
    'click #uploadAddPay': function(e){
        e.preventDefault();
        Modal.show('ImportModal');
    },
    'click .pointer': function(e, tmpl){
        Modal.show('AdditionalPayCreate', this.data);
    }
});

/*****************************************************************************/
/* AdditionalPayEntry: Helpers */
/*****************************************************************************/
Template.AdditionalPayEntry.helpers({
    'additonalPay': () => {
        return AdditionalPayEntryments.find();
    }
});

/*****************************************************************************/
/* AdditionalPayEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.AdditionalPayEntry.onCreated(function () {
    let self = this;
    let limit = 10;
    self.subscribe('AdditionalPayEntrymentDeduction', Session.get('context'), limit) ;
});

Template.AdditionalPayEntry.onRendered(function () {
});

Template.AdditionalPayEntry.onDestroyed(function () {
});
