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
