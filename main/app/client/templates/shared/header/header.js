

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
    },
    'click .requisitionApprovalSeen': function(e, tmpl) {
        e.preventDefault()
        e.stopPropagation()

        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)
        let businessUnitId = Session.get('context')

        Meteor.call('ProcurementRequisition/markApprovalAsSeen', businessUnitId, requisitionId, function(err, res) {
            if(!err) {
            } else {
                swal('Validation error', err.message, 'error')
            }
        })
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
    'procurementsICreatedThatApproved': function() {
        return Template.instance().procurementsICreatedThatApproved.get()
    },
    'currentUserId': function() {
        return Meteor.userId();
    }
});

Template.header.onCreated(function() {
    let self = this

    let businessUnitId = Session.get('context')

    self.procurementsToApprove = new ReactiveVar()
    self.procurementsICreatedThatApproved = new ReactiveVar()

    let procurementsSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)
    let procurementsCreatedThatApprovedSub = self.subscribe('ProcurementRequisitionsICreated', businessUnitId)

    self.autorun(function() {
        if(procurementsSub.ready()) {
            console.log(`ProcurementsSub is ready`)

            let currentUser = Meteor.user()

            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({
                    supervisorPositionId: currentUserPosition,
                    status: 'Pending'
                })
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
        if(procurementsCreatedThatApprovedSub.ready()) {
            self.procurementsICreatedThatApproved.set(ProcurementRequisitions.find({
                createdBy: Meteor.userId(),
                status: 'Treated',
                creatorIsAwareOfApproval: {$ne: true}
            }))
        }
    })
})

Template.header.onRendered(function () {

});

