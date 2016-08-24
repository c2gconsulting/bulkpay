/*****************************************************************************/
/* Divisions: Event Handlers */
/*****************************************************************************/
Template.Divisions.events({
    'click #createDivision': function(e){
        e.preventDefault();
        Modal.show('DivisionCreate');
    }
});

/*****************************************************************************/
/* Divisions: Helpers */
/*****************************************************************************/
Template.Divisions.helpers({
    division: function(){
        return Divisions.find();
    }
});

/*****************************************************************************/
/* Divisions: Lifecycle Hooks */
/*****************************************************************************/
Template.Divisions.onCreated(function () {
    let self = this;
    self.subscribe("Divisions", Session.get('context'));
});

Template.Divisions.onRendered(function () {
});

Template.Divisions.onDestroyed(function () {
});


Template.singleDivision.helpers({
    'parent': function() {
        let pid = this.parentId;
        return Divisions.findOne({_id: pid});
    },
    'bu': function(){
       let buId = this.businessId;
        return BusinessUnits.findOne({_id: buId});
    }
});