/*****************************************************************************/
/* LeaveTypeEntry: Event Handlers */
/*****************************************************************************/
Template.LeaveTypeEntry.events({
    'click .pointer': (e,tmpl) => {
        console.log(tmpl.data);
        Modal.show('LeaveTypeCreate', tmpl.data);
        //swal("you clicked pointer", this, "success");
    }
});

/*****************************************************************************/
/* LeaveTypeEntry: Helpers */
/*****************************************************************************/
Template.LeaveTypeEntry.helpers({
});

/*****************************************************************************/
/* LeaveTypeEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LeaveTypeEntry.onCreated(function () {
});

Template.LeaveTypeEntry.onRendered(function () {
});

Template.LeaveTypeEntry.onDestroyed(function () {
});
