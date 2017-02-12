/*****************************************************************************/
/* ConstantList: Event Handlers */
/*****************************************************************************/
Template.ConstantList.events({
    'click #createConstant': function(e){
        e.preventDefault();
        Modal.show('ConstantCreate');
    }
});

/*****************************************************************************/
/* ConstantList: Helpers */
/*****************************************************************************/
Template.ConstantList.helpers({
    'constants': function() {
        return Template.instance().constant();
    }
});

/*****************************************************************************/
/* ConstantList: Lifecycle Hooks */
/*****************************************************************************/
Template.ConstantList.onCreated(function () {

    let instance = this;
    instance.loaded = new ReactiveVar(0);
    instance.limit = new ReactiveVar(getLimit());
    instance.ready = new ReactiveVar();
    instance.subscribe("Constants", instance.data._id);


    instance.autorun(function () {
        let limit = instance.limit.get();
        let sortBy = "createdAt";
        let sortDirection =  -1;
        let sort = {};
        sort[sortBy] = sortDirection;
        console.log(instance.data._id, "as business id");
        let subscription = Meteor.subscribe('Constants', {businessId: instance.data._id}, limit, sort);


        // if subscription is ready, set limit to newLimit
        if (subscription.ready()) {
            instance.loaded.set(limit);
        }
    });


    instance.constant = function() {
        let sortBy = "createdAt";
        let sortDirection = -1;

        let options = {};
        options.sort = {};
        options.sort[sortBy] = sortDirection;
        options.limit = instance.loaded.get();

        return Constants.find({}, options);
    };
});

Template.ConstantList.onRendered(function () {
});

Template.ConstantList.onDestroyed(function () {
});


function getLimit() {
    return 20;
}