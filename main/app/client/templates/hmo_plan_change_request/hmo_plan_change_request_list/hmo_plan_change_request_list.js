/*****************************************************************************/
/* HmoPlanChangeRequestList: Event Handlers */
/*****************************************************************************/
Template.HmoPlanChangeRequestList.events({
    'click #createLeave': function(e){
        e.preventDefault();
        Modal.show('HmoPlanChangeRequestCreate');
    }
});

/*****************************************************************************/
/* HmoPlanChangeRequestList: Helpers */
/*****************************************************************************/
Template.HmoPlanChangeRequestList.helpers({
    leaves: function() {
        return Template.instance().leaves.get();
    }
});

/*****************************************************************************/
/* HmoPlanChangeRequestList: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanChangeRequestList.onCreated(function () {
    let instance = this;    
    instance.leaves = new ReactiveVar()

    instance.autorun(function () {
        let subscription = instance.subscribe('HmoPlanChangeRequests', Session.get('context'));
        if(subscription.ready()) {
            let currentUserId = Meteor.userId()

            instance.leaves.set(HmoPlanChangeRequests.find({
                businessId: Session.get('context'),
                employeeId: currentUserId
            }).fetch());
        }
    });
});

Template.HmoPlanChangeRequestList.onRendered(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.HmoPlanChangeRequestList.onDestroyed(function () {
});
