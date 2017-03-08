/*****************************************************************************/
/* EmployeePayrollDetailsDataEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeePayrollDetailsDataEntry');
    },
    'click #save': (e, tmpl) => {
      Modal.hide('EmployeePayrollDetailsDataEntry');
    }
});

/*****************************************************************************/
/* EmployeePayrollDetailsDataEntry: Helpers */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.helpers({
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
/* EmployeePayrollDetailsDataEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePayrollDetailsDataEntry.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeePayrollDetailsDataEntry.onRendered(function () {
});

Template.EmployeePayrollDetailsDataEntry.onDestroyed(function () {
});
