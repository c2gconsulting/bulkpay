/*****************************************************************************/
/* EmployeeSelectedEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeSelectedEntry.events({
  'click #employee-edit-personaldata': function(e, tmpl) {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    if(selectedEmployee) {
      Modal.show('EmployeePersonalDataModal');
    }
  },
  'click #employee-edit-nextofkin-data': function(e, tmpl) {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    if(selectedEmployee) {
      Modal.show('EmployeeNextOfKinDataModal');
    }
  },
  'click #employee-edit-emergencycontact-data': function(e, tmpl) {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    if(selectedEmployee) {
      Modal.show('EmployeeEmergencyContactDataModal');
    }
  },
  'click #employee-edit-paymentdetails-data': function(e, tmpl) {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    if(selectedEmployee) {
      Modal.show('EmployeePaymentDetailsDataModal');
    }
  },
  'click #employment-payroll-link': function(e, tmpl) {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    if(selectedEmployee) {
      Modal.show("EmployeeEditEmploymentPayrollModal");
    }
  },
  'click #employee-edit-roles-data': function(e, tmpl) {
    // let selectedEmployee = Session.get('employeesList_selectedEmployee');
    // if(selectedEmployee) {
    //   Modal.show("EmployeeEditEmploymentPayrollModal");
    // }
  }
});

/*****************************************************************************/
/* EmployeeSelectedEntry: Helpers */
/*****************************************************************************/
Template.EmployeeSelectedEntry.helpers({
  "selectedEmployee": () => {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      if(selectedEmployee)
        return [selectedEmployee];
      else
        return null;
  },
  "images": (id) => {
      return UserImages.findOne({_id: id});
  },
  positionName: (id)=> {
      console.log('position id as', id);
      return EntityObjects.findOne({_id: id}).name;
  },
  hasRoleManageAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    //console.log("selectedEmployee: " + JSON.stringify(selectedEmployee));

    let canManageRoles = Core.hasRoleManageAccess(Meteor.userId())
    return canManageRoles;
  },
  hasEmployeeAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canManageEmployeeData = Core.hasEmployeeAccess(selectedEmployee._id)
    return canManageEmployeeData;
  },
  hasTimeApprovalAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canApproveTime = Core.hasTimeApprovalAccess(selectedEmployee._id)
    return canApproveTime;
  },
  hasTimeManageAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canManageTime = Core.hasTimeManageAccess(selectedEmployee._id)
    return canManageTime;
  },
  hasLeaveApprovalAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canApproveLeave = Core.hasLeaveApprovalAccess(selectedEmployee._id);
    return canApproveLeave;
  },
  hasLeaveManageAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canManageLeave = Core.hasLeaveManageAccess(selectedEmployee._id);
    return canManageLeave;
  },
  hasPayrollAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canManagePayroll = Core.hasPayrollAccess(selectedEmployee._id);
    return canManagePayroll;
  }
});

/*****************************************************************************/
/* EmployeeSelectedEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeSelectedEntry.onCreated(function () {
    let self = this;
    Session.set('employeesList_selectedEmployee', undefined);

    self.autorun(()=> {

      }
    );
});

Template.EmployeeSelectedEntry.onRendered(function () {
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployee', undefined);
});
