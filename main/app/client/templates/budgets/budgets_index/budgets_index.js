/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.BudgetIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('BudgetCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/***************************************************************************/
Template.BudgetIndex.helpers({
    'pfas': function(){
      let allPfas = Budgets.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Budgets.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.BudgetIndex.onCreated(function () {
    let self = this;
    self.subscribe("budgets", Session.get('context'));
});

Template.BudgetIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.BudgetIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleBudget.events({
    'click #deleteBudget': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Budget Holder",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const budgetId = self.data._id;
            const code = self.data.code;

            Meteor.call('budget/delete', budgetId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Budget Holder: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
