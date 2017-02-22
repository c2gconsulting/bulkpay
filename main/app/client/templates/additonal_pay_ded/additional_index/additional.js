/*****************************************************************************/
/* AdditionalPay: Event Handlers */
/*****************************************************************************/
Template.AdditionalPay.events({
    'click #newAddPay': function(e){
        e.preventDefault();
        Modal.show('AdditionalPayCreate');
    },
    'click #uploadAddPay': function(e){
        e.preventDefault();
        Modal.show('ImportModal');
    }
});

/*****************************************************************************/
/* AdditionalPay: Helpers */
/*****************************************************************************/
Template.AdditionalPay.helpers({
    'additonalPay': () => {
        return AdditionalPayments.find();
    }
});

/*****************************************************************************/
/* AdditionalPay: Lifecycle Hooks */
/*****************************************************************************/
Template.AdditionalPay.onCreated(function () {
    let self = this;
    let limit = 20;
    self.subscribe('AdditionalPaymentDeduction', Session.get('context'), limit) ;
});

Template.AdditionalPay.onRendered(function () {
});

Template.AdditionalPay.onDestroyed(function () {
});
