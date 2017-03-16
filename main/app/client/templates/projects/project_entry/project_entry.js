/*****************************************************************************/
/* ProjectEntry: Event Handlers */
/*****************************************************************************/
Template.ProjectEntry.events({
    'click .pointer': (e,tmpl) => {

    },
    'click #edit': (e,tmpl) => {
        Modal.show('ProjectCreate', tmpl.data);
        //swal("you clicked pointer", this, "success");
    },
    'click #delete': (e,tmpl) => {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this project!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        },
        function(){
            let docId = tmpl.data._id;
            let leavetype = tmpl.data.name;
            Meteor.call("project/delete", docId, function(err,res){
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
/* ProjectEntry: Helpers */
/*****************************************************************************/
Template.ProjectEntry.helpers({
    'paidUnpaid': (paid)=>{
        return paid? "Paid Leave": "Unpaid Leave";
    },
    'active': (status) => {
        return status === "Active" ? "success" : "danger";
    },
    'name': (id) => {
        return EntityObjects.findOne({_id: id}).name
    }
});

/*****************************************************************************/
/* ProjectEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.ProjectEntry.onCreated(function () {
});

Template.ProjectEntry.onRendered(function () {
});

Template.ProjectEntry.onDestroyed(function () {
});

