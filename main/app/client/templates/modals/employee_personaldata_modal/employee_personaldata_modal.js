/*****************************************************************************/
/* EmployeePersonalDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePersonalDataModal.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeePersonalDataModal');
    },
    'click #save': (e, tmpl) => {
      Modal.hide('EmployeePersonalDataModal');
    }
});

/*****************************************************************************/
/* EmployeePersonalDataModal: Helpers */
/*****************************************************************************/
Template.EmployeePersonalDataModal.helpers({
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return selectedEmployee;
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
/* EmployeePersonalDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePersonalDataModal.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeePersonalDataModal.onRendered(function () {
});

Template.EmployeePersonalDataModal.onDestroyed(function () {
});
