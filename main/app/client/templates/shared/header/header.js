

Template.header.events({
    'click .requisitionRow': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    }
});


Template.registerHelper('trimString', function(passedString, startstring, endstring) {
    var theString = passedString.substring( startstring, endstring );
    return new Handlebars.SafeString(theString)
});

Template.header.helpers({
    'context': function(){
        return Session.get('context');
    },
    'procurementsToApprove': function() {
        return Template.instance().procurementsToApprove.get()
    },
    'currentUserId': function() {
        return Meteor.userId();
    }
});

Template.header.onCreated(function() {
    let self = this

    let businessUnitId = Session.get('context')

    self.procurementsToApprove = new ReactiveVar()

    let procurementsSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)

    self.autorun(function() {
        if(procurementsSub.ready()) {
            console.log(`ProcurementsSub is ready`)

            let currentUser = Meteor.user()

            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({
                    supervisorPositionId: currentUserPosition,
                    status: 'Pending'
                }).fetch();
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
    })
})

Template.header.onRendered(function () {

});

