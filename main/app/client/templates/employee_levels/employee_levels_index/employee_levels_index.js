/*****************************************************************************/
/* EmployeeLevelsIndex: Event Handlers */
/*****************************************************************************/
Template.EmployeeLevelsIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('EmployeeLevelsCreate');
    }
});

/*****************************************************************************/
/* EmployeesLevels: Helpers */
/*****************************************************************************/
Template.EmployeeLevelsIndex.helpers({
    'pfas': function(){
      let allPfas = EmployeesLevels.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return EmployeesLevels.find().count();
    },

});

/*****************************************************************************/
/* EmployeesLevels: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeLevelsIndex.onCreated(function () {
    let self = this;
    self.subscribe("employeeslevels", Session.get('context'));
    self.subscribe("travelcities", Session.get('context'));
});

Template.EmployeeLevelsIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.EmployeeLevelsIndex.onDestroyed(function () {
});

/*****************************************************************************/
/* singleEmployeeLevels: Helpers */
/*****************************************************************************/
Template.singleEmployeeLevels.events({
    'click .pointer': function(e, tmpl){
        e.preventDefault();
        Modal.show('EmployeeLevelsCreate', this.data);
    }
})

Template.singleEmployeeLevels.helpers({
    'getTravelcityName': function(travelcityId) {
        const travelcity = Travelcities.findOne({_id: travelcityId})
        if(travelcity) {
            return travelcity.name
        }
    }
});
