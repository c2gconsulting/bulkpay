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
    Template.instance().setEmployeePermissons();
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
    console.log("selected employee id: " + selectedEmployee._id);

    let canManagePayroll = Core.hasPayrollAccess(selectedEmployee._id);
    console.log("canManagePayroll: " + canManagePayroll);

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

    self.setEmployeePermissons = function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      if(selectedEmployee) {
        let shouldManageEmployeeData = $("[name=employeeManage]").val();
        let shouldApproveLeave = $("[name=leaveApprove]").val();
        let shouldManageLeave = $("[name=leaveManage]").val();
        let shouldApproveTime = $("[name=timeApprove]").val();
        let shouldManageTime = $("[name=timeManage]").val();
        let shouldManagePayroll = $("[name=payrollManage]").val();

        let arrayOfRoles = [];
        if(shouldManageEmployeeData === "true") {
          arrayOfRoles.push(Core.Permissions.EMPLOYEE_MANAGE)
        }
        if(shouldApproveLeave === "true") {
          arrayOfRoles.push(Core.Permissions.LEAVE_APPROVE)
        }
        if(shouldManageLeave === "true") {
          arrayOfRoles.push(Core.Permissions.LEAVE_MANAGE)
        }
        if(shouldApproveTime === "true") {
          arrayOfRoles.push(Core.Permissions.TIME_APPROVE)
        }
        if(shouldManageTime === "true") {
          arrayOfRoles.push(Core.Permissions.TIME_MANAGE)
        }
        if(shouldManagePayroll === "true") {
          arrayOfRoles.push(Core.Permissions.PAYROLL_MANAGE)
        }
        console.log("shouldManageEmployeeData: " + shouldManageEmployeeData);
        console.log("shouldApproveLeave: " + shouldApproveLeave);
        console.log("shouldManageLeave: " + shouldManageLeave);
        console.log("shouldApproveTime: " + shouldApproveTime);
        console.log("shouldManageTime: " + shouldManageTime);
        console.log("shouldManagePayroll: " + shouldManagePayroll);

        Meteor.call('role/setRolesForUser', selectedEmployee._id, arrayOfRoles, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Employee roles updated`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                console.log(err);
            }
        });
      }
    };
});

Template.EmployeeSelectedEntry.onRendered(function () {
  // let selectedEmployee = Session.get('employeesList_selectedEmployee');
  // if(selectedEmployee) {
  //   console.log("has payroll access: " + self.hasPayrollAccess());
  //
  //   $("[name=payrollManage]").val(self.hasPayrollAccess());
  // } else {
  //
  // }
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployee', undefined);
});
