Template.BusinessUnit.events({
    'click #savebu': function(event){
        event.preventDefault();
        let details = {};
        details.name = $('[name="bu-name"]').val();
        details.location = $('[name="bu-location"]').val();
        details.parentId = $('[name="bu-parent"]').val();
        Meteor.call('businessunit/create', details, function(err, res){
            if (res){
                console.log(res);
                $('#new-unit-close').click();
                Router.go('bu.details', res);
            } else {
                console.log(err);
                // add necessary path
            }
        });
    }
});

Template.BusinessUnit.helpers({
    'bus': function(){
        return BusinessUnits.find();
    }

});

Template.singleBu.helpers({
   'parent': function(){
       let parent = this.parentId;
       return BusinessUnits.findOne({_id: parent});
       //let business = BusinessUnits.find({_id: parent}).fetch() ? BusinessUnits.find({_id: parent}).fetch() : {};

   }
});