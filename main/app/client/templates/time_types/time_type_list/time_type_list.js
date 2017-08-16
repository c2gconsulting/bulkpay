/*****************************************************************************/
/* TimeTypesList: Event Handlers */
/*****************************************************************************/
Template.TimeTypesList.events({
    'click #createLeaveType': function(e){
        e.preventDefault();
        Modal.show('TimeTypeCreate');
    }
});

/*****************************************************************************/
/* TimeTypesList: Helpers */
/*****************************************************************************/
Template.TimeTypesList.helpers({
    'timeType': function() {
        return Template.instance().leaveType();
    },
    'leaveTypeCount': () => {
        return TimeTypes.find().fetch().length;
    }
});

/*****************************************************************************/
/* TimeTypesList: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeTypesList.onCreated(function () {
    
    let instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();
    
    console.log(`template instance data: `, instance.data)

    instance.autorun(function () {
        let limit = instance.limit.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;
        
        let subscription = Meteor.subscribe('TimeTypes', {businessId: instance.data._id}, limit, sort);
        

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
        
        return TimeTypes.find({}, options);
    };
});

Template.TimeTypesList.onRendered(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.TimeTypesList.onDestroyed(function () {
});


function getLimit() {
    return 20;
}