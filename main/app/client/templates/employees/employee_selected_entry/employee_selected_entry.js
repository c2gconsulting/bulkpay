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
      if(id) {
        let entity = EntityObjects.findOne({_id: id})
        if(entity) {
            return entity.name;
        }
      } else {
        return "";
      }
  },
  isEqual: (a, b) => {
    return a === b;
  },
  selectedUserLeaveEntitlements: function() {
      return Template.instance().selectedUserLeaveEntitlements.get()
  },
  selectedUserLeaveEntitlementId: function() {
      let selectedLeaveEntitlement = Template.instance().selectedUserLeaveEntitlements.get()
      console.log(`selectedLeaveEntitlement`, selectedLeaveEntitlement)

      if(selectedLeaveEntitlement) {
        return selectedLeaveEntitlement.leaveEntitlementId
      }
  },
  allUserLeaveEntitlements: function() {
      return Template.instance().allLeaveEntitlements.get()
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
  },
  canSetLeaveEntitlement: () => {
    let userId = Meteor.userId()

    return Core.hasEmployeeAccess(userId) || Core.hasLeaveManageAccess(userId)
  },
  hasProcurementRequisitionApproveAccess: () => {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      console.log("selected employee id: " + selectedEmployee._id);

      let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(selectedEmployee._id);
      console.log("canApproveProcurementApprove: " + canApproveProcurement);

      return canApproveProcurement;
  }
});

/*****************************************************************************/
/* EmployeeSelectedEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeSelectedEntry.onCreated(function () {
    let self = this;
    Session.set('employeesList_selectedEmployee', undefined);

    let businessId = Session.get('context')

    self.allLeaveEntitlements = new ReactiveVar()
    self.selectedUserLeaveEntitlements = new ReactiveVar()

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
        let shouldApproveProcurementRequisition = $("[name=procurementRequisitionApprove]").val();

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
        if(shouldApproveProcurementRequisition === "true") {
            arrayOfRoles.push(Core.Permissions.PROCUREMENT_REQUISITION_APPROVE)
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

    self.autorun(function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        if(selectedEmployee) {
            let userEntitlementSubs = self.subscribe('UserLeaveEntitlement', businessId, selectedEmployee._id)
            let allLeaveEntitlements = self.subscribe('LeaveEntitlements', businessId)

            if(userEntitlementSubs.ready() && allLeaveEntitlements.ready()){
                let selectedUserLeaveEntitlements = UserLeaveEntitlements.findOne({
                    businessId: businessId, userId: selectedEmployee._id
                })
                self.selectedUserLeaveEntitlements.set(selectedUserLeaveEntitlements)

                let allLeaveEntitlements = LeaveEntitlements.find({
                    businessId: businessId
                }).fetch()
                self.allLeaveEntitlements.set(allLeaveEntitlements)
            }
        }
    })
});

Template.EmployeeSelectedEntry.onRendered(function () {
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployee', undefined);
});
