/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeeNextOfKinDataModal');
    },
    'click #save': (e, tmpl) => {
      Modal.hide('EmployeeNextOfKinDataModal');
    }
});

/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Helpers */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    positions: () => {
        return EntityObjects.find();
    },
    'states': () => {
        return Core.states();
    },
    'countries': () => {
        return Core.IsoCountries();
    },
    'defaultCountry': (ccode) => {
        return ccode === Core.country ? selected="selected":"";
    },
    'selectedPosition': () => {
        return Template.instance().selectedPosition.get();
    },
    'grades': () => {
        return PayGrades.find();
    },
});

/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeeNextOfKinDataModal.onRendered(function () {
});

Template.EmployeeNextOfKinDataModal.onDestroyed(function () {
});
