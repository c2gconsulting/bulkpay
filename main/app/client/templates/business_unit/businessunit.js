Template.BusinessUnit.events({
    'click #newUnit': function(event){
       event.preventDefault();
        console.log("You just clicked the new unit buton");
        Modal.show('newBuModal');
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
Template.singleBu.events({
    'click .pointer': function(e) {
        e.preventDefault();
        Router.go('bu.details', this);
    }
});