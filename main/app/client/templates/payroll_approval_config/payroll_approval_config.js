/*****************************************************************************/
/* PayrollApprovalConfig: Event Handlers */
/*****************************************************************************/


Template.PayrollApprovalConfig.events({
    'click #save': (e,tmpl) => {
        let requireApproval = $('input[name=requireApproval]:checked').val()
        let approver1UserId = $('[name="approver1"]').val() || ''
        let approver2UserId = $('[name="approver2"]').val() || ''
        let approver3UserId = $('[name="approver3"]').val() || ''

        approver1UserId = (approver1UserId === '-') ? '' : approver1UserId
        approver2UserId = (approver2UserId === '-') ? '' : approver2UserId
        approver3UserId = (approver3UserId === '-') ? '' : approver3UserId

        let approvers = [approver1UserId, approver2UserId, approver3UserId]

        let requireApprovalAsBoolean = false
        if(requireApproval === 'yes') {
            requireApprovalAsBoolean = true
        } else if(requireApproval === 'no') {
            requireApprovalAsBoolean = false
        }
        
        let approvalDoc = {
            requirePayrollApproval: requireApprovalAsBoolean,
            approvers: approvers,
            businessId: Session.get('context')
        }

        Meteor.call("payrollApprovalConfig/save",  Session.get('context'), approvalDoc, (err, res) => {
            if(res) {
                swal('Success', 'Config saved successfully!', 'success')
            } else {
                console.log(err);
                swal("Server Error", err.message || 'An error occurred in saving the config', "error");
            }
            Blaze.remove(view);
        })
    }
});

/*****************************************************************************/
/* PayrollApprovalConfig: Helpers */
/*****************************************************************************/
Template.PayrollApprovalConfig.helpers({
    'employees': () => {
        return [''].concat(Meteor.users.find({"employee": true}).fetch());
    },
    'checkInitial': (index) => {
        return index === 0 ? 'checked': null;
    }
});

/*****************************************************************************/
/* PayrollApprovalConfig: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrollApprovalConfig.onCreated(function () {
    let self = this;

    self.subscribe("activeEmployees", Session.get('context'));
});

Template.PayrollApprovalConfig.onRendered(function () {
     $('select.dropdown').dropdown();
});

Template.PayrollApprovalConfig.onDestroyed(function () {
});
