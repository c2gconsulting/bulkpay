/*****************************************************************************/
/* LeaveList: Event Handlers */
/*****************************************************************************/
Template.LeaveList.events({
    'click #createLeave': function(e){
        e.preventDefault();
        Modal.show('LeaveCreate');
    }
});

/*****************************************************************************/
/* LeaveList: Helpers */
/*****************************************************************************/
Template.LeaveList.helpers({
    leaves: function() {
        return Template.instance().leaves();
    }
});

/*****************************************************************************/
/* LeaveList: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveList.onCreated(function () {
    
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
        
        return Leaves.find({businessId: instance.data._id}, options);
    };
});

Template.LeaveList.onRendered(function () {
});

Template.LeaveList.onDestroyed(function () {
});


function getLimit() {
    return 10;
}