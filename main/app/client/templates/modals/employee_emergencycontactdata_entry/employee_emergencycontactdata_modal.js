/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.events({

});

/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Helpers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.helpers({
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
/* EmployeeEmergencyContactDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeeEmergencyContactDataModal.onRendered(function () {
});

Template.EmployeeEmergencyContactDataModal.onDestroyed(function () {
});
