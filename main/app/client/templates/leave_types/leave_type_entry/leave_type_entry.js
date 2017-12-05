/*****************************************************************************/
/* LeaveTypeEntry: Event Handlers */
/*****************************************************************************/
Template.LeaveTypeEntry.events({
    'click .pointer': (e,tmpl) => {

    },
    'click #edit': (e,tmpl) => {
        Modal.show('LeaveTypeCreate', tmpl.data);
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Leave Type!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                let leavetype = tmpl.data.name;
                Meteor.call("leavetypes/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Leave Type ${leavetype} deleted`, "success");
                    } else {
                        swal("Error!", `Cannot delete ${leavetype}`, "error");
                    }
                });

            });
    }
});

/*****************************************************************************/
/* LeaveTypeEntry: Helpers */
/*****************************************************************************/
Template.LeaveTypeEntry.helpers({
    'paidUnpaid': (paid)=>{
        return paid? "Paid Leave": "Unpaid Leave";
    },
    'active': (status) => {
        return status === "Active" ? "success" : "danger";
    }
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

