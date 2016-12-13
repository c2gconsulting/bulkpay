/**
 * Core Collection Hooks
 * transform collections based on events
 *
 * See: https://github.com/matb33/meteor-collection-hooks
 */

if (Meteor.isClient){
    AutoForm.hooks({
        leavesForm: {
            onSuccess: function(formType, result) {
                Modal.hide('LeaveCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        },
        leavesTypesForm: {
            onSuccess: function(formType, result) {
                Modal.hide('LeaveCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        },
        updateLeaveTypesForm: {
            onSuccess: function(formType, result) {
                Modal.hide('LeaveCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        }
    });
}
