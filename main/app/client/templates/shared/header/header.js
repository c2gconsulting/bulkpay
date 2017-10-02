

Template.header.events({
    'click #navigationModal': function(e, tmpl) {
        Modal.show('navigationModal')
        e.preventDefault()
    },
    'click .requisitionRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

        let invokeReason = {}
        invokeReason.requisitionId = requisitionId
        invokeReason.reason = 'approve'
        invokeReason.approverId = Meteor.userId()

        Modal.show('ProcurementRequisitionDetail', invokeReason)
    },
    'click .requisitionRowForEdit': function(e, tmpl) {
        e.preventDefault()
        let requisitionId = e.currentTarget.getAttribute('data-RequisitionId')

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
        let businessUnitId = Session.get('context')

        Meteor.call('ProcurementRequisition/markAsSeen', businessUnitId, requisitionId, function(err, res) {
            if(err) {
                swal('Validation error', err.message, 'error')
            }
        })
    },
    'click .timeRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let timeId = e.currentTarget.getAttribute('data-timeId')
        Modal.show('selectedEvent', {type: 'TimeWritings', id: timeId})
    },
    'click .leaveRowForApproval': function(e, tmpl) {
        e.preventDefault()
        let leaveId = e.currentTarget.getAttribute('data-leaveId')
        Modal.show('selectedEvent', {type: 'Leaves', id: leaveId})
    },
    'click .leaveApprovalSeen': function(e, tmpl) {
        e.preventDefault()

        let leaveId = e.currentTarget.getAttribute('data-leaveId')
        let businessUnitId = Session.get('context')

        Meteor.call('Leaves/markAsSeen', businessUnitId, leaveId, function(err, res) {
            if(err) {
                swal('Validation error', err.message, 'error')
            }
        })
    },
    'click .timeApprovalSeen': function(e, tmpl) {
        e.preventDefault()

        let timeId = e.currentTarget.getAttribute('data-timeId')
        let businessUnitId = Session.get('context')

        Meteor.call('time/markAsSeen', businessUnitId, timeId, function(err, res) {
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
    'timesStatusNotSeen': function() {
        return Template.instance().timesStatusNotSeen.get()
    },
    'leavesToApprove': function() {
        return Template.instance().leavesToApprove.get()
    },
    'leavesApprovalStatusNotSeen': function() {
        return Template.instance().leavesApprovalStatusNotSeen.get()
    },
    'getLeaveTypeName': function(leaveTypeId) {
        let leaveType = LeaveTypes.findOne({_id: leaveTypeId})
        return leaveType ? leaveType.name : '---'
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'getActivityDescription': function(time) {
        let activity = Activities.findOne({_id: time.activity})
        return activity ? activity.description : '---';
    },
    'getTimeNoteText': function(note) {
        if(note && note.length > 0) {
            return note
        } else 
            return "---"
    },
    businessUnitLogoUrl: function() {
        let businessUnitLogoUrl = Template.instance().businessUnitLogoUrl.get()
        return (businessUnitLogoUrl) ? businessUnitLogoUrl : null
    }
});

Template.header.onCreated(function() {
    let self = this

    self.businessUnitName = new ReactiveVar()
    self.businessUnitLogoUrl = new ReactiveVar()

    self.procurementsToApprove = new ReactiveVar()
    self.procurementsStatusNotSeen = new ReactiveVar()

    self.timesToApprove = new ReactiveVar()
    self.timesStatusNotSeen = new ReactiveVar()

    self.leavesToApprove = new ReactiveVar()
    self.leavesApprovalStatusNotSeen = new ReactiveVar()   // By leave creator

    self.businessUnitCustomConfig = new ReactiveVar()

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
        if(!businessUnitId)
            return

        let businessUnitSubscription = self.subscribe("BusinessUnit", businessUnitId)
        
        Meteor.call('BusinessUnitCustomConfig/getConfig', businessUnitId, function(err, res) {
            if(!err) {
                self.businessUnitCustomConfig.set(res)
            }
        })

        self.subscribe('AllActivities', Session.get('context'));

        let procurementsToApproveSub = self.subscribe('ProcurementRequisitionsToApprove', businessUnitId)
        let procurementsStatusNotSeenSub = self.subscribe('ProcurementRequisitionsStatusNotSeen', businessUnitId)
        //--
        let allEmployeesSub = self.subscribe('allEmployees', businessUnitId)
        let timesAndLeavesSub = self.subscribe('alltimedata', businessUnitId)  // This handles the subscription for 'times' and 'leaves'

        if(businessUnitSubscription.ready()) {
            let businessUnit = BusinessUnits.findOne({_id: businessUnitId})
            self.businessUnitName.set(businessUnit.name)
            
            let businessUnitCustomConfig = self.businessUnitCustomConfig.get()

            if(businessUnitCustomConfig && businessUnitCustomConfig.displayLogoInSideBar) {
                self.businessUnitLogoUrl.set(businessUnit.logoUrl)
            }
        }

        if(procurementsToApproveSub.ready()) {
            let currentUser = Meteor.user()

            if(currentUser.employeeProfile && currentUser.employeeProfile.employment) {
                let currentUserPosition = currentUser.employeeProfile.employment.position

                let procurementsToApprove = ProcurementRequisitions.find({
                    $or: [{supervisorPositionId : currentUserPosition}, 
                            {alternativeSupervisorPositionId: currentUserPosition}],
                    status: 'Pending'
                }).fetch()
                // console.log(`[header.js] procurementsToApprove: ${JSON.stringify(procurementsToApprove)}`)
                self.procurementsToApprove.set(procurementsToApprove)
            }
        }
        if(procurementsStatusNotSeenSub.ready()) {
            self.procurementsStatusNotSeen.set(ProcurementRequisitions.find({
                createdBy: Meteor.userId(),
                $or: [{status: 'Approved'}, {status: 'Rejected'}],
                isStatusSeenByCreator: {$ne: true}
            }).fetch())
        }

        if(allEmployeesSub.ready() && timesAndLeavesSub.ready()) {
            let user = Meteor.user()
            
            if (!user || !user.employeeProfile || !user.employeeProfile.employment 
                || !user.employeeProfile.employment.position){
                return
            }

            let positions = EntityObjects.find({"properties.supervisor": user.employeeProfile.employment.position}).fetch().map(x=>{
                return x._id
            });
            const selector = {
                businessIds: businessUnitId,
                "employeeProfile.employment.position": {$in: positions}
            };

            let allSuperviseeIds = []

            // Meteor.users.find({businessIds: businessUnitId}).fetch().forEach(aUser => {
            Meteor.users.find().fetch().forEach(aUser => {
                let userPositionId = aUser.employeeProfile.employment.position
                if(positions.indexOf(userPositionId) !== -1) {
                    allSuperviseeIds.push(aUser._id)
                }
            });

            let timesToApprove = TimeWritings.find({
                employeeId: {$in: allSuperviseeIds},
                status: 'Open'
            }).fetch()
            self.timesToApprove.set(timesToApprove)
            //--
            // let timesStatusNotSeen = TimeWritings.find({
            //     employeeId: Meteor.userId(),
            //     $or: [{status: 'Approved'}, {status: 'Rejected'}],
            //     isApprovalStatusSeenByCreator : {$ne: true}
            // }).fetch() || []
            // self.timesStatusNotSeen.set(timesStatusNotSeen)
            //--
            let leavesToApprove = Leaves.find({
                employeeId: {$in: allSuperviseeIds},
                approvalStatus: 'Open'
            }).fetch()
            self.leavesToApprove.set(leavesToApprove)
            //--
            let leavesStatusNotSeen = Leaves.find({
                employeeId: Meteor.userId(),
                $or: [{approvalStatus: 'Approved'}, {approvalStatus: 'Rejected'}],
                isApprovalStatusSeenByCreator : {$ne: true}
            }).fetch()
            self.leavesApprovalStatusNotSeen.set(leavesStatusNotSeen)
        }
    })
})

Template.header.onRendered(function () {
    var logoHeight = $('#businessLogoLeftBar img').height();
    if (logoHeight < 30) {
        var margintop = (30 - logoHeight) / 2;
        $('#businessLogoLeftBar img').css('margin-top', margintop);
    }
});

Template.header.onDestroyed(function() {
    Modal.hide('selectedEvent')
})
