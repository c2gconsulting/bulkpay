/*****************************************************************************/
/* ConstantEntry: Event Handlers */
/*****************************************************************************/
Template.ConstantEntry.events({
    'click .pointer': (e,tmpl) => {

    },
    'click #edit': (e,tmpl) => {
        Modal.show('ConstantCreate', tmpl.data.data);
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Constant!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                let constant = tmpl.data.code;
                Meteor.call("constant/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Constant ${constant} deleted`, "success");
                    } else {
                        swal("Error!", `Cannot delete ${constant}`, "error");
                    }
                });

            });
    }
});

/*****************************************************************************/
/* ConstantEntry: Helpers */
/*****************************************************************************/
Template.ConstantEntry.helpers({
    'activeClass': function(){
        return this.data.status === "Active" ? "success" : "danger";
    }

});

/*****************************************************************************/
/* ConstantEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.ConstantEntry.onCreated(function () {
});

Template.ConstantEntry.onRendered(function () {
});

Template.ConstantEntry.onDestroyed(function () {
});

