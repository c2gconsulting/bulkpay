/*****************************************************************************/
/* HmoPlansList: Event Handlers */
/*****************************************************************************/
Template.HmoPlansList.events({
    'click #createLeaveType': function(e){
        e.preventDefault();
        Modal.show('HmoPlanCreate');
    }
});

/*****************************************************************************/
/* HmoPlansList: Helpers */
/*****************************************************************************/
Template.HmoPlansList.helpers({
    'timeType': function() {
        return Template.instance().leaveType();
    },
    'leaveTypeCount': () => {
        return HmoPlans.find().fetch().length;
    }
});

/*****************************************************************************/
/* HmoPlansList: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlansList.onCreated(function () {
    
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
        
        let subscription = Meteor.subscribe('HmoPlans', {businessId: instance.data._id}, limit, sort);
        

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
        
        return HmoPlans.find({}, options);
    };
});

Template.HmoPlansList.onRendered(function () {
});

Template.HmoPlansList.onDestroyed(function () {
});


function getLimit() {
    return 20;
}