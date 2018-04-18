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
  },
  'click #userLeaveEntitlementSave': function(e, tmpl) {
    let allUserLeaveEntitlements = $("[name=allUserLeaveEntitlements]").val();

    if(allUserLeaveEntitlements && allUserLeaveEntitlements.length > 0) {
      let year = moment().year()
      let yearAsNumber = parseInt(year)

      let businessId = Session.get('context')
      let selectedEmployee = Session.get('employeesList_selectedEmployee');

      Meteor.call('LeaveEntitlement/setForOneEmployee', businessId, selectedEmployee._id, allUserLeaveEntitlements, yearAsNumber, (err, res) => {
          if (res){
              swal({
                  title: "Success",
                  text: `Leave entitlement saved!`,
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
          } else {
            swal('Save error!', err.reason, 'error')
          }
      });
    } else {
      swal('Save error!', 'You did not select a leave entitlement', 'error')      
    }
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
  hasPayRulesManageAccess: function () {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');

    let hasPayrulesManageAccess = Core.hasPayRulesManageAccess(selectedEmployee._id);
    return hasPayrulesManageAccess;
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
    let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(selectedEmployee._id);

    return canApproveProcurement;
  },
  isProcurementRequisitionActive: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
    } else {
        return true
    }
  },
  isSuccessfactorsEnabled: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSuccessFactorsIntegrationEnabled
    } else {
        return true
    }
  },
  hasTravelRequisitionApproveAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let canApproveTrip = Core.hasTravelRequisitionApproveAccess(selectedEmployee._id);

    return canApproveTrip;
  },
  isTravelRequisitionActive: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
    } else {
        return true
    }
  },
  hasPayrollReportsViewAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let hasPayrollReportsViewAccess = Core.hasPayrollReportsViewAccess(selectedEmployee._id);

    return hasPayrollReportsViewAccess;
  },
  hasAuditReportsViewAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let hasAuditReportsViewAccess = Core.hasAuditReportsViewAccess(selectedEmployee._id);

    return hasAuditReportsViewAccess;
  },
  hasProcurementReportsViewAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let hasProcurementReportsViewAccess = Core.hasProcurementReportsViewAccess(selectedEmployee._id);

    return hasProcurementReportsViewAccess;
  },
  hasProcurementTreatAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let hasProcurementTreatAccess = Core.hasProcurementTreatAccess(selectedEmployee._id);

    return hasProcurementTreatAccess;
  },
  hasTravelRequestTreatAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    let hasTravelRequestTreatAccess = Core.hasTravelRequestTreatAccess(selectedEmployee._id);

    return hasTravelRequestTreatAccess;
  },
  hasSuccessfactorsManageAccess: () => {
    let selectedEmployee = Session.get('employeesList_selectedEmployee');
    return Core.hasSuccessfactorManagesAccess(selectedEmployee._id);
  },
  isLeaveRequestEnabled: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isLeaveRequestActive
    } else {
        return true
    }
  },
  isTimeWritingEnabled: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTimeWritingActive
    } else {
        return true
    }
  },
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

    self.businessUnitCustomConfig = new ReactiveVar()

    self.setEmployeePermissons = function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      if(selectedEmployee) {
        let shouldManageEmployeeData = $("[name=employeeManage]").val();
        let shouldApproveLeave = $("[name=leaveApprove]").val();
        let shouldManageLeave = $("[name=leaveManage]").val();
        let shouldApproveTime = $("[name=timeApprove]").val();
        let shouldManageTime = $("[name=timeManage]").val();
        let shouldHaveEmployeeSelfService = $("[name=employeeSelfService]").val();

        let shouldManagePayRules = $("[name=payRulesManage]").val();
        let shouldManagePayroll = $("[name=payrollManage]").val();
        let shouldApproveProcurementRequisition = $("[name=procurementRequisitionApprove]").val();
        let shouldTravelRequestApprove = $("[name=travelRequestApprove]").val();

        let shouldProcurementRequisitionTreat = $("[name=procurementRequisitionTreat]").val();
        let shouldTravelRequestTreat = $("[name=travelRequestTreat]").val();

        let payrollReportsView = $("[name=payrollReportsView]").val();
        let auditReportsView = $("[name=auditReportsView]").val();
        let procurementReportsView = $("[name=procurementReportsView]").val();
        let successfactorsManage = $("[name=successfactorsManage]").val();


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
        if(shouldManagePayRules === "true") {
          arrayOfRoles.push(Core.Permissions.PAYRULES_MANAGE)
        }
        if(shouldManagePayroll === "true") {
          arrayOfRoles.push(Core.Permissions.PAYROLL_MANAGE)
        }
        if(shouldApproveProcurementRequisition === "true") {
            arrayOfRoles.push(Core.Permissions.PROCUREMENT_REQUISITION_APPROVE)
        }
        if(shouldTravelRequestApprove === "true") {
            arrayOfRoles.push(Core.Permissions.TRAVEL_REQUISITION_APPROVE)
        }

        if(shouldProcurementRequisitionTreat === "true") {
          arrayOfRoles.push(Core.Permissions.PROCUREMENT_REQUISITION_TREAT)
        }
        if(shouldTravelRequestTreat === "true") {
          arrayOfRoles.push(Core.Permissions.TRAVEL_REQUISITION_TREAT)
        }

        if(payrollReportsView === "true") {
            arrayOfRoles.push(Core.Permissions.PAYROLL_REPORTS_VIEW)
        }
        if(auditReportsView === "true") {
            arrayOfRoles.push(Core.Permissions.AUDIT_REPORTS_VIEW)
        }
        if(procurementReportsView === "true") {
            arrayOfRoles.push(Core.Permissions.PROCUREMENT_REPORTS_VIEW)
        }
        if(successfactorsManage === "true") {
            arrayOfRoles.push(Core.Permissions.SUCCESSFACTORS_MANAGE)
        }

        if(Core.hasRoleManageAccess(Meteor.userId())) {
          let shouldHaveRoleManageAccess = $("[name=roleManage]").val();
          if(shouldHaveRoleManageAccess === "true") {
            arrayOfRoles.push(Core.Permissions.ROLE_MANAGE);
          }
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
            let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessId, Core.getTenantId());

            if(userEntitlementSubs.ready() && allLeaveEntitlements.ready() && customConfigSub.ready()){
                let selectedUserLeaveEntitlements = UserLeaveEntitlements.findOne({
                    businessId: businessId, userId: selectedEmployee._id
                })
                self.selectedUserLeaveEntitlements.set(selectedUserLeaveEntitlements)

                let allLeaveEntitlements = LeaveEntitlements.find({
                    businessId: businessId
                }).fetch()
                self.allLeaveEntitlements.set(allLeaveEntitlements)
                //--
                self.businessUnitCustomConfig.set(BusinessUnitCustomConfigs.findOne({businessId: businessId}))
            }
        }
    })
});

Template.EmployeeSelectedEntry.onRendered(function () {
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployee', undefined);
});
