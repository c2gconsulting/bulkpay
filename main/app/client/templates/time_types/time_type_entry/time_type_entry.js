/*****************************************************************************/
/* TimeTypeEntry: Event Handlers */
/*****************************************************************************/
Template.TimeTypeEntry.events({
    'click .pointer': (e,tmpl) => {

    },
    'click #edit': (e,tmpl) => {
        Modal.show('TimeTypeCreate', tmpl.data);
        //swal("you clicked pointer", this, "success");
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Time Type!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                let leavetype = tmpl.data.name;

                Meteor.call("timetypes/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Time Type: "${leavetype}" deleted`, "success");
                    } else {
                        swal("Error!", `Cannot delete Time Type: "${leavetype}"`, "error");
                    }
                });
            });
    }
});

/*****************************************************************************/
/* TimeTypeEntry: Helpers */
/*****************************************************************************/
Template.TimeTypeEntry.helpers({
    'paidUnpaid': (paid)=>{
        return paid? "Paid Time": "Unpaid Time";
    },
    'active': (status) => {
        return status === "Active" ? "success" : "danger";
    }
});

/*****************************************************************************/
/* TimeTypeEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.TimeTypeEntry.onCreated(function () {
});

Template.TimeTypeEntry.onRendered(function () {
});

Template.TimeTypeEntry.onDestroyed(function () {
});

