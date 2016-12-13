/*****************************************************************************/
/* ProjectList: Event Handlers */
/*****************************************************************************/
Template.ProjectList.events({
    'click #createProject': function(e){
        e.preventDefault();
        Modal.show('ProjectCreate');
    }
});

/*****************************************************************************/
/* ProjectList: Helpers */
/*****************************************************************************/
Template.ProjectList.helpers({
    'project': function() {
        return Template.instance().project();
    }
});

/*****************************************************************************/
/* ProjectList: Lifecycle Hooks */
/*****************************************************************************/
Template.ProjectList.onCreated(function () {
    
    let instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();
    instance.subscribe("getPositions", instance.data._id);
    

    instance.autorun(function () {
        let limit = instance.limit.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;
        let subscription = Meteor.subscribe('projects', {businessId: instance.data._id}, limit, sort);
        

        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });


    instance.project = function() {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();
        
        return Projects.find({}, options);
    };
});

Template.ProjectList.onRendered(function () {
});

Template.ProjectList.onDestroyed(function () {
});


function getLimit() {
    return 20;
}