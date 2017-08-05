/*****************************************************************************/
/* PayrollApprovalConfig: Event Handlers */
/*****************************************************************************/


Template.PayrollApprovalConfig.events({
    'click #save': (e,tmpl) => {

        let requireApproval = $('input[name=requireApproval]:checked').val()
        let approver1UserId = $('[name="approver1"]').val()
        let approver2UserId = $('[name="approver2"]').val()
        let approver3UserId = $('[name="approver3"]').val()

        console.log(`requireApproval: `, requireApproval)
        console.log(`approver1UserId: `, approver1UserId)
        console.log(`approver2UserId: `, approver2UserId)
        console.log(`approver3UserId: `, approver3UserId)
        
        // if (params.employees.length > 0 || params.paygrades.length > 0){
        //     Meteor.call("payrollApprovalConfig/save",  params, Session.get('context'), (err, res) => {
        //         if(res) {
        //         } else {
        //             console.log(err);
        //         }
        //         Blaze.remove(view);
        //     })
        // } else {
        //     Blaze.remove(view);
        //     swal("notice","A valid selection must be made", "error");
        // }
    }
});

/*****************************************************************************/
/* PayrollApprovalConfig: Helpers */
/*****************************************************************************/
Template.PayrollApprovalConfig.helpers({
    'employees': () => {
        return Meteor.users.find({"employee": true});
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
