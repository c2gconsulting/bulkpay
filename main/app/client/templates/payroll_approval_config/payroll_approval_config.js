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
    },
    payrollApprovalConfig: () => {
        return Template.instance().payrollApprovalConfig.get()
    },
    isEqual: (a, b) => {
        console.log(`a: `, )
        return a === b;
    }
});

/*****************************************************************************/
/* PayrollApprovalConfig: Lifecycle Hooks */
/*****************************************************************************/
Template.PayrollApprovalConfig.onCreated(function () {
    let self = this;

    self.payrollApprovalConfig = new ReactiveVar()

    let businessUnitId = Session.get('context');

    self.subscribe("activeEmployees", Session.get('context'));
    self.subscribe('PayrollApprovalConfigs', businessUnitId);


    self.autorun(function() {
        if (Template.instance().subscriptionsReady()){
            let payrollApprovalConfig = PayrollApprovalConfigs.findOne({businessId: businessUnitId})
            self.payrollApprovalConfig.set(payrollApprovalConfig)
        }
    })
});

Template.PayrollApprovalConfig.onRendered(function () {
     $('select.dropdown').dropdown();

     let self = this

     self.autorun(function() {
        let payrollApprovalConfig = self.payrollApprovalConfig.get()
        console.log(`payrollApprovalConfig: `, payrollApprovalConfig)

        if(payrollApprovalConfig) {
            let requirePayrollApproval = payrollApprovalConfig.requirePayrollApproval
            if(requirePayrollApproval) {
                $('input[name=requireApproval]').val("yes")
            } else {
                $('input[name=requireApproval]').val("no")
            }
        }
    })
});

Template.PayrollApprovalConfig.onDestroyed(function () {
});
