Template.BusinessUnit.events({
    'click #newUnit': function(event){
        event.preventDefault();
        let bus = BusinessUnits.find();
        //add none to array list after calling.fetch()
        //bus.unshift({_id: null, name: "Parent Business Unit"});
        Modal.show('newBuModal', bus);
    }
});

Template.BusinessUnit.helpers({
    'bus': function(){
        return BusinessUnits.find();
    }

});

Template.BusinessUnit.onCreated(function(){
    let self = this;
    self.subscribe("BusinessUnits");

});

Template.singleBu.helpers({
    'parentName': function(data){
        if(data.parentId){
            let bu = BusinessUnits.findOne({_id: data.parentId});
            return bu.name;
        }
        return null;

    }
});
Template.singleBu.events({
    'click .pointer': function(e) {
        e.preventDefault();
        Router.go('bu.details', this.data);
    }
});