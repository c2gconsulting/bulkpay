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
      if(selectedEmployee) {
        if(selectedEmployee.roles) {
          if(!selectedEmployee.roles[Roles.GLOBAL_GROUP]) {
            selectedEmployee.roles[Roles.GLOBAL_GROUP] = [];
          }
        } else {
          selectedEmployee.roles = {};
          selectedEmployee.roles[Roles.GLOBAL_GROUP] = [];
        }
        return [selectedEmployee];
      } else
        return null;
  },
  "images": (id) => {
      return UserImages.findOne({_id: id});
  },
  positionName: (id)=> {
      if(id)
        return EntityObjects.findOne({_id: id}).name;
      else {
        return "";
      }
  },
  hasRoleManageAccess: () => {
    let canManageRoles = Core.hasRoleManageAccess(Meteor.userId())
    return canManageRoles;
  },
  doesEmployeeHasRoleManageAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    return Core.hasRoleManageAccess(selectedEmployee._id);
  },
  hasEmployeeAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canManageEmployeeData = Core.hasEmployeeAccess(selectedEmployee._id)
    return canManageEmployeeData;
  },
  hasTimeApprovalAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canApproveTime = Core.hasTimeApprovalAccess(selectedEmployee._id)
    console.log("canApproveTime: " + canApproveTime);
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
  hasEmployeeSelfServiceAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let canDoSelfService = Core.hasSelfServiceAccess(selectedEmployee._id);
    return canDoSelfService;
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

    self.setEmployeePermissons = function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      if(selectedEmployee) {
        let shouldManageEmployeeData = $("[name=employeeManage]").val();
        let shouldApproveLeave = $("[name=leaveApprove]").val();
        let shouldManageLeave = $("[name=leaveManage]").val();
        let shouldApproveTime = $("[name=timeApprove]").val();
        let shouldManageTime = $("[name=timeManage]").val();
        let shouldHaveEmployeeSelfService = $("[name=employeeSelfService]").val();
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
        if(shouldHaveEmployeeSelfService === "true") {
          arrayOfRoles.push(Core.Permissions.EMPLOYEE_SS)
        }
        if(shouldManagePayroll === "true") {
          arrayOfRoles.push(Core.Permissions.PAYROLL_MANAGE)
        }
        if(Core.hasRoleManageAccess(Meteor.userId())) {
          let shouldHaveRoleManageAccess = $("[name=roleManage]").val();
          if(shouldHaveRoleManageAccess === "true") {
            arrayOfRoles.push(Core.Permissions.ROLE_MANAGE);
          }
          console.log("shouldHaveRoleManageAccess: " + shouldHaveRoleManageAccess);
        } else {
          console.log("Does current user have role manage access");
        }

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
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployee', undefined);
});
