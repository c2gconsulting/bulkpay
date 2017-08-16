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
        return Template.instance().leaves();
    }
});

/*****************************************************************************/
/* HmoPlanChangeRequestList: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanChangeRequestList.onCreated(function () {
    let instance = this;    

    instance.autorun(function () {
        let subscription = instance.subscribe('HmoPlanChangeRequests', Session.get('context'));
    });

    instance.leaves = function() {
        let currentUserId = Meteor.userId()

        return HmoPlanChangeRequests.find({
            businessId: Session.get('context'),
            employeeId: currentUserId
        });
    };
});

Template.HmoPlanChangeRequestList.onRendered(function () {
});

Template.HmoPlanChangeRequestList.onDestroyed(function () {
});
