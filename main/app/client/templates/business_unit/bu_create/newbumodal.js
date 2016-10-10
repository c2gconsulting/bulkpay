Template.newBuModal.events({
    'click #savebu': function(event){
        event.preventDefault();
        let details = {};
        details.name = $('[name="name"]').val();
        details.location = $('[name="location"]').val();
        details.parentId = $('[name="bu-parent"]').val();
        Meteor.call('businessunit/create', details, function(err, res){
            if (res){
                Modal.hide('newBuModal');
                swal({
                    title: "Success",
                    text: `Company Created`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Router.go('bu.details', res);
            } else {
                details = JSON.parse(err.details);
                // add necessary handler on error
                //use details from schema.key to locate html tag and error handler
                _.each(details, (obj) => {
                    $('[name=' + obj.name +']').addClass('errorValidation');
                    $('[name=' + obj.name +']').attr("placeholder", obj.name + ' ' + obj.type);

                })
            }
        });
    }
});

Template.newBuModal.helpers({

});