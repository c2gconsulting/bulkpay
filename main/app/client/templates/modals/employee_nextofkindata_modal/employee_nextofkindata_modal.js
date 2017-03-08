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
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return [selectedEmployee];
    },
    'states': () => {
        return Core.states();
    }
});

/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.onCreated(function () {
  let self = this;

  self.getEditUser = () => {
    return Session.get('employeeNextOfKinData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeNextOfKinData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  delete selectedEmployee.employeeProfile.guarantor;
  delete selectedEmployee.employeeProfile.employment;
  delete selectedEmployee.employeeProfile.emergencyContact;
  delete selectedEmployee.employeeProfile.payment;

  self.setEditUser(selectedEmployee);
});

Template.EmployeeNextOfKinDataModal.onRendered(function () {
});

Template.EmployeeNextOfKinDataModal.onDestroyed(function () {
});
