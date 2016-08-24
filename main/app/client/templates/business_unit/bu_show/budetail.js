Template.BUDetail.events({
    'click #delete-bu': function(event, tmpl){
        event.preventDefault();
        //Check user is authorized to delete business unit
        let bu = this._id;
        let confirm = window.confirm("Delete Business Unit?");
        if(confirm){
            Meteor.call('businessunit/delete', bu, function(err, res){
                if(!err){
                    Router.go('businessunits');
                }
            });
        }
    }
});