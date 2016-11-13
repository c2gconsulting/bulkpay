/*****************************************************************************/
/* EntityObjects Denotes orgChart: Event Handlers */
/*****************************************************************************/
Template.OrgChart.events({
    'click #createDivision': function(e){
        e.preventDefault();
        Modal.show('DivisionCreate');
    }
});

/*****************************************************************************/
/* Divisions: Helpers */
/*****************************************************************************/
Template.OrgChart.helpers({
    division: function(){
        return Divisions.find();
    }
});

/*****************************************************************************/
/* Divisions: Lifecycle Hooks */
/*****************************************************************************/
Template.OrgChart.onCreated(function () {
    let self = this;
    self.subscribe("Divisions", Session.get('context'));
});

Template.OrgChart.onRendered(function () {
});

Template.OrgChart.onDestroyed(function () {
});


Template.singleOrgChart.helpers({
    'parent': function() {
        let pid = this.parentId;
        return Divisions.findOne({_id: pid});
    },
    'bu': function(){
       let buId = this.businessId;
        return BusinessUnits.findOne({_id: buId});
    }
});