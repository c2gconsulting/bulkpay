/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.events({

});

/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Helpers */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.helpers({
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
/* EmployeePaymentDetailsDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeePaymentDetailsDataModal.onRendered(function () {
});

Template.EmployeePaymentDetailsDataModal.onDestroyed(function () {
});
