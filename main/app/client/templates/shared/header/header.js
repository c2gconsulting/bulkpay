

Template.header.events({
    'click .requisitionRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .requisitionRowForEdit': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'edit'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .requisitionApprovalSeen': function(e, tmpl) {
        e.preventDefault()
        e.stopPropagation()

        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')
        console.log(`RequisitionId: ${requisitionId}`)
        let businessUnitId = Session.get('context')

        Meteor.call('ProcurementRequisition/markAsSeen', businessUnitId, requisitionId, function(err, res) {
            if(err) {
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
    'procurementsStatusNotSeen': function() {
        return Template.instance().procurementsStatusNotSeen.get()
    },
    'timesToApprove': function() {
        return Template.instance().timesToApprove.get()
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'getActivityDescription': function(activityId) {
        return Activities.findOne({_id: activityId}).description;
    }
});

Template.header.onCreated(function() {
    console.log(`[header.js] inside onCreated`)
    let self = this

    self.procurementsToApprove = new ReactiveVar()
    self.procurementsStatusNotSeen = new ReactiveVar()

    self.timesToApprove = new ReactiveVar()
    self.timesStatusNotSeen = new ReactiveVar()

    self.getIds = (users) => {
        const newUsers = [...users];
        const ids = newUsers.map(x => {
            //get unique ids of users
            return x._id;
        });
        return ids;
    }

    self.autorun(function() {
        let businessUnitId = Session.get('context')

        let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)
        let procurementsStatusNotSeenSub = self.subscribe('ProcurementRequisitionsStatusNotSeen', businessUnitId)
        //--
        let allEmployeesSub = self.subscribe('allEmployees', businessUnitId)
        //let allActivitesSub = self.subscribe('AllActivities', businessUnitId);
        let timesAndLeavesSub = self.subscribe('timedata', businessUnitId)

        if(procurementsToApproveSub.ready()) {
            console.log(`ProcurementsSub is ready`)
            let currentUser = Meteor.user()

            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({
                    supervisorPositionId: currentUserPosition,
                    status: 'Pending'
                }).fetch()
                console.log(`[header.js] procurementsToApprove: ${JSON.stringify(procurementsToApprove)}`)
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
        if(procurementsStatusNotSeenSub.ready()) {
            self.procurementsStatusNotSeen.set(ProcurementRequisitions.find({
                createdBy: Meteor.userId(),
                $or: [{status: 'Treated'}, {status: 'Rejected'}],
                isStatusSeenByCreator: {$ne: true}
            }).fetch())
        }

        if(allEmployeesSub.ready() && timesAndLeavesSub.ready()) {
            console.log(`allEmployeesSub, allActivitesSub, timesAndLeavesSub is ready`)
            let user = Meteor.user()
            let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
                return x._id
            });
            const selector = {
                businessIds: businessUnitId,
                "employeeProfile.employment.position": {$in: positions}
            };
            console.log(`selector: ${JSON.stringify(selector)}`)

            let allSuperviseeIds = []

            Meteor.users.find().fetch().forEach(aUser => {
                let userPositionId = aUser.employeeProfile.employment.position
                if(positions.indexOf(userPositionId) !== -1) {
                    allSuperviseeIds.push(aUser._id)
                }
            });
            console.log(`allSuperviseeIds: ${JSON.stringify(allSuperviseeIds)}`)

            let timesToApprove = Times.find({
                employeeId: {$in: allSuperviseeIds},
                status: 'Open'
            }).fetch()
            console.log(`Times to approve: ${JSON.stringify(timesToApprove)}`)

            self.timesToApprove.set(timesToApprove)
        }
    })
})

Template.header.onRendered(function () {

});
