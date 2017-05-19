/*****************************************************************************/
/* LeaveEntitlementCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveEntitlementCreate.events({
    'click #LeaveEntitlementCreate': (e, tmpl) => {
        e.preventDefault()

        let leaveEntitlementName = $('#leaveEntitlementName').val();
        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        let numberOfLeaveDaysPerAnnum = $('#numberOfLeaveDaysPerAnnum').val();

        let numberOfLeaveDaysPerAnnumAsNumber = parseFloat(numberOfLeaveDaysPerAnnum)

        if(!leaveEntitlementName || leaveEntitlementName.trim().length === 0) {
            tmpl.inputErrorMsg.set("You need to specify the entitlement's name")
            return
        }
        if(!numberOfLeaveDaysPerAnnum || numberOfLeaveDaysPerAnnum.trim().length === 0) {
            tmpl.inputErrorMsg.set("You need to number of leave days per year for this entitlement")
            return
        }
        tmpl.inputErrorMsg.set(null)

        // //--
        let leaveEntitlementDoc = {
            name: leaveEntitlementName,
            allowLeaveRequestsInHours: allowLeavesInHours,
            numberOfLeaveDaysPerAnnum: numberOfLeaveDaysPerAnnum,
            businessId: Session.get('context')
        }

        Meteor.call('LeaveEntitlement/create', leaveEntitlementDoc, function(err, res) {
            Modal.hide('LeaveEntitlementCreate')
            if(!err) {
                swal('Successful', "Leave entitlement successful", 'success')
            } else {
                swal('Error', err.reason, 'error')
            }
        })
    }
});

/*****************************************************************************/
/* LeaveEntitlementCreate: Helpers */
/*****************************************************************************/
Template.LeaveEntitlementCreate.helpers({
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    }
});


/*****************************************************************************/
/* LeaveEntitlementCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntitlementCreate.onCreated(function () {
    let self = this
    self.inputErrorMsg = new ReactiveVar()
});

Template.LeaveEntitlementCreate.onRendered(function () {
    let self = this;
});

Template.LeaveEntitlementCreate.onDestroyed(function () {
});
