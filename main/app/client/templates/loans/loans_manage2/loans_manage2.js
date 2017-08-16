/*****************************************************************************/
/* LoansList: Event Handlers */
/*****************************************************************************/
Template.LoansList.events({
    'click #createLeave': function(e){
        e.preventDefault();
        Router.go('loans.new', {_id: Session.get('context')});
    }
});

/*****************************************************************************/
/* LoansList: Helpers */
/*****************************************************************************/
Template.LoansList.helpers({
    theLoans: function() {
        return Template.instance().leaves.get()
    }
});

/*****************************************************************************/
/* LoansList: Lifecycle Hooks */
/*****************************************************************************/
Template.LoansList.onCreated(function () {
    
    let instance = this;

    instance.loans = new ReactiveVar()    

    instance.autorun(function () {
        let subscription = instance.subscribe('employeeLoansNoPagination', Session.get('context'));

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            let currentUserId = Meteor.userId()

            instance.loans.set(Loans2.find({
                businessId: Session.get('context'),
                employeeId: currentUserId
            }).fetch());
        }
    });
});

Template.LoansList.onRendered(function () {
    // window.scrollTo(0, 0);
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.LoansList.onDestroyed(function () {
});


function getLimit() {
    return 10;
}