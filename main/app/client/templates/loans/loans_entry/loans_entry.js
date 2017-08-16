/*****************************************************************************/
/* LoansEntry: Event Handlers */
/*****************************************************************************/
Template.LoansEntry.events({
    'click #edit': (e,tmpl) => {
        Modal.show('LoansNew', tmpl.data);
    },
    'click #delete': (e,tmpl) => {
        swal({
                title: "Are you sure?",
                text: "You will not be able to recover this Loan Request!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function(){
                let docId = tmpl.data._id;
                Meteor.call("Loans/delete", docId, function(err,res){
                    if(!err){
                        swal("Deleted!", `Request Deleted`, "success");
                    } else {
                        swal("Error!", err.reason, "error");
                    }
                });

            });
    }
});

/*****************************************************************************/
/* LoansEntry: Helpers */
/*****************************************************************************/
Template.LoansEntry.helpers({
    'active': (status) => {
        if(status === "Open")
            return "warning";
        if(status === "Approved")
            return "success";
        if(status === "Rejected")
            return "danger";
    },
    'canEdit': ()=> {
        let status = Template.instance().data.approvalStatus;
        if(status){
            return status !== "Approved";
        }
    },
    'click view': () => {

    },
    'toTwoDecimalPlaces': function(theNumber) {
        return theNumber ? theNumber.toFixed(2) : ''
    }
});

/*****************************************************************************/
/* LoansEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LoansEntry.onCreated(function () {
});

Template.LoansEntry.onRendered(function () {
});

Template.LoansEntry.onDestroyed(function () {
});
