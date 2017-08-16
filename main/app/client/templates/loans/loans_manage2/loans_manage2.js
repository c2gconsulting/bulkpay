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
    leaves: function() {
        return Template.instance().leaves();
    }
});

/*****************************************************************************/
/* LoansList: Lifecycle Hooks */
/*****************************************************************************/
Template.LoansList.onCreated(function () {
    
    let instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();
    

    instance.autorun(function () {
        let limit = instance.limit.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;
        let subscription = instance.subscribe('employeeLeaves', Session.get('context'), limit, sort);

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });


    instance.leaves = function() {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();

        let currentUserId = Meteor.userId()

        return Leaves.find({
            businessId: Session.get('context'),
            employeeId: currentUserId
        }, options);
    };
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