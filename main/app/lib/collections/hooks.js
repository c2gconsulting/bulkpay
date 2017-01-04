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
        },
        projectForm: {
            onSuccess: function(formType, result) {
                Modal.hide('ProjectCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        },
        updateProjectForm: {
            onSuccess: function(formType, result) {
                Modal.hide('ProjectCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        },
        TimeForm: {
            onSuccess: function(formType, result) {
                Modal.hide('TimeCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        },
        updateTimeForm: {
            onSuccess: function(formType, result) {
                Modal.hide('TimeCreate')
            },
            onError: function(operation, error, template) {
                console.log(error)
            }
        }
    });
}
