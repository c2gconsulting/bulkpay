/*****************************************************************************/
/* Paygrades: Event Handlers */
/*****************************************************************************/
Template.Paygrades.events({
    'click #createPaygrade': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PaygradeCreate');
    }
});

/*****************************************************************************/
/* Paygrades: Helpers */
/*****************************************************************************/
Template.Paygrades.helpers({
    fixed: (paytype) => {
        return paytype.derivative == "Fixed"
    },
    'paygrades': () => {
        return PayGrades.find();
    }
});

/*****************************************************************************/
/* Paygrades: Lifecycle Hooks */
/*****************************************************************************/
Template.Paygrades.onCreated(function () {
    let self = this;
    self.subscribe("paygrades", Session.get('context'));
    self.subscribe("getPositions", Session.get('context'));
});

Template.Paygrades.onRendered(function () {

});

Template.Paygrades.onDestroyed(function () {
});

Template.Paygrades.helpers({

});

Template.Paygrades.events({
    'click .pointer': function(e, tmpl){
        let element = e.currentTarget
        let payGradeId = $(element).attr('data-payGradeId')
        Session.set('selectedPayGradeForEdit', payGradeId)

        Modal.show('PaygradeCreate', this.data);
    }
});



Template.singlePaygrade.helpers({
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }
});