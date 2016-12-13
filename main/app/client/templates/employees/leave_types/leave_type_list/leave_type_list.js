/*****************************************************************************/
/* LeaveTypeList: Event Handlers */
/*****************************************************************************/
Template.LeaveTypeList.events({
    'click #createLeaveType': function(e){
        e.preventDefault();
        Modal.show('LeaveTypeCreate');
    }
});

/*****************************************************************************/
/* LeaveTypeList: Helpers */
/*****************************************************************************/
Template.LeaveTypeList.helpers({
    leaveType: function() {
        return Template.instance().leaveType();
    }
});

/*****************************************************************************/
/* LeaveTypeList: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveTypeList.onCreated(function () {
    
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
        
        let subscription = Meteor.subscribe('LeaveTypes', {businessId: instance.data._id}, limit, sort);
        

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });


    instance.leaveType = function() {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();
        
        return LeaveTypes.find({businessId: instance.data._id}, options);
    };
});

Template.LeaveTypeList.onRendered(function () {
});

Template.LeaveTypeList.onDestroyed(function () {
});


function getLimit() {
    return 5;
}