/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.events({
  'click #save-close': (e, tmpl) => {
    Modal.hide('EmployeeNextOfKinDataModal');
  },
  'click #save': (e, tmpl) => {
    Modal.hide('EmployeeNextOfKinDataModal');
  }
});

/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Helpers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.helpers({
  "selectedEmployee": function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      return [selectedEmployee];
  },
  'states': () => {
      return Core.states();
  }
});

/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.onCreated(function () {
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

Template.EmployeeEmergencyContactDataModal.onRendered(function () {
});

Template.EmployeeEmergencyContactDataModal.onDestroyed(function () {
});
