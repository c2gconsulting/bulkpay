Template.newBuModal.events({
    'click #savebu': function(event){
        event.preventDefault();
        let details = {};
        details.name = $('[name="bu-name"]').val();
        details.location = $('[name="bu-location"]').val();
        details.parentId = $('[name="bu-parent"]').val();
        Meteor.call('businessunit/create', details, function(err, res){
            if (res){
                console.log(res);
                Modal.hide('newBuModal');
                Router.go('bu.details', res);
            } else {
                console.log(err);
                // add necessary path
            }
        });
    }
});