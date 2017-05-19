/*****************************************************************************/
/* LeaveEntitlementCreate: Event Handlers */
/*****************************************************************************/
Template.LeaveEntitlementCreate.events({
    'click #LeaveEntitlementCreate': (e, tmpl) => {
        e.preventDefault()

        let leaveEntitlementName = $('#leaveEntitlementName').val();
        let numberOfLeaveDaysPerAnnum = $('#numberOfLeaveDaysPerAnnum').val();
        let allowLeavesInHours = $('#allowLeavesInHours').is(":checked")
        let applyEntitlementToEmployeesWithPaygrade = $('#applyEntitlementToEmployeesWithPaygrade').is(":checked")

        let numberOfLeaveDaysPerAnnumAsNumber = parseFloat(numberOfLeaveDaysPerAnnum)

        if(!leaveEntitlementName || leaveEntitlementName.trim().length === 0) {
            tmpl.inputErrorMsg.set("You need to specify the entitlement's name")
            return
        }
        if(!numberOfLeaveDaysPerAnnum || numberOfLeaveDaysPerAnnum.trim().length === 0) {
            tmpl.inputErrorMsg.set("You need to number of leave days per year for this entitlement")
            return
        }

        let employeePayGradesToApplyEntitlementTo = []
        if(applyEntitlementToEmployeesWithPaygrade) {
            employeePayGradesToApplyEntitlementTo = tmpl.selectedPaygrades.get()
        }

        tmpl.inputErrorMsg.set(null)

        //--
        let leaveEntitlementDoc = {
            name: leaveEntitlementName,
            allowLeaveRequestsInHours: allowLeavesInHours,
            numberOfLeaveDaysPerAnnum: numberOfLeaveDaysPerAnnum,
            payGradeIds: employeePayGradesToApplyEntitlementTo,
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
    },
    'change #applyEntitlementToEmployeesWithPaygrade': function(e, tmpl) {
        let applyEntitlementToEmployeesWithPaygrade = $('#applyEntitlementToEmployeesWithPaygrade').is(":checked")
        if(applyEntitlementToEmployeesWithPaygrade) {
            $('#payGradesSemanticSelect').show()
        } else {
            $('#payGradesSemanticSelect').hide()
        }
    },
    'change [name="employeePayGrades"]': (e, tmpl) => {
        let selected = Core.returnSelection($(e.target));
        tmpl.selectedPaygrades.set(selected)
    }
});

/*****************************************************************************/
/* LeaveEntitlementCreate: Helpers */
/*****************************************************************************/
Template.LeaveEntitlementCreate.helpers({
    inputErrorMsg: function() {
        return Template.instance().inputErrorMsg.get()
    },
    payGrades: function() {
        return PayGrades.find({status: 'Active'}).fetch()
    },
});


/*****************************************************************************/
/* LeaveEntitlementCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveEntitlementCreate.onCreated(function () {
    let self = this
    self.inputErrorMsg = new ReactiveVar()
    self.selectedPaygrades = new ReactiveVar()


    self.subscribe('paygrades', Session.get('context'));
});

Template.LeaveEntitlementCreate.onRendered(function () {
    let self = this;
    $('#payGradesSemanticSelect').hide()
});

Template.LeaveEntitlementCreate.onDestroyed(function () {
});
