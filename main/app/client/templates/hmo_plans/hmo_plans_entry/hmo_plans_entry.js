/*****************************************************************************/
/* HmoPlanEntry: Event Handlers */
/*****************************************************************************/
Template.HmoPlanEntry.events({
    'click .pointer': (e,tmpl) => {

    },
    'click #edit': (e,tmpl) => {
        Modal.show('HmoPlanCreate', tmpl.data);
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

                Meteor.call("hmoPlans/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `HMO Plan: "${leavetype}" deleted`, "success");
                    } else {
                        swal("Error!", `Cannot delete HMO Plan: "${leavetype}"`, "error");
                    }
                });
            });
    }
});

/*****************************************************************************/
/* HmoPlanEntry: Helpers */
/*****************************************************************************/
Template.HmoPlanEntry.helpers({
    'paidUnpaid': (paid)=>{
        return paid? "Paid Time": "Unpaid Time";
    },
    'active': (status) => {
        return status === "Active" ? "success" : "danger";
    }
});

/*****************************************************************************/
/* HmoPlanEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.HmoPlanEntry.onCreated(function () {
});

Template.HmoPlanEntry.onRendered(function () {
});

Template.HmoPlanEntry.onDestroyed(function () {
});

