Template.navigator.onRendered(function () {

});

Template.navigator.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    hasProcurementRequisitionApproveAccess: () => {
        let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
        console.log("canApproveProcurementApprove: " + canApproveProcurement);

        return canApproveProcurement;
    }
});

Template.navlist.onRendered(function () {
    Deps.autorun(function () {
        initAll();
    });
});
