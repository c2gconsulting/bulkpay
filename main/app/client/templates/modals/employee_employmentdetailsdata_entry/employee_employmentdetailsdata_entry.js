/*****************************************************************************/
/* EmployeeEmploymentDetailsDataEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeEmploymentDetailsDataEntry.events({

});

/*****************************************************************************/
/* EmployeeEmploymentDetailsDataEntry: Helpers */
/*****************************************************************************/
Template.EmployeeEmploymentDetailsDataEntry.helpers({
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
/* EmployeeEmploymentDetailsDataEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEmploymentDetailsDataEntry.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));
});

Template.EmployeeEmploymentDetailsDataEntry.onRendered(function () {
});

Template.EmployeeEmploymentDetailsDataEntry.onDestroyed(function () {
});
