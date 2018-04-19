Template.navigationModal.events({
    'click #companyMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payRulesMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #sapB1IntegrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #successFactorsIntegrationMenu': function(event, tmpl) {
      let menuId = $(event.currentTarget).attr('id')
      console.log(`menuId: `, menuId)

      let currentExpandedMenu = tmpl.expandedMenu.get()
      if(menuId === currentExpandedMenu) {
          tmpl.expandedMenu.set(null)
      } else {
          tmpl.expandedMenu.set(menuId)
      }
  },
  'click #sapHanaIntegrationMenu': function(event, tmpl) {
    let menuId = $(event.currentTarget).attr('id')
    console.log(`menuId: `, menuId)

    let currentExpandedMenu = tmpl.expandedMenu.get()
    if(menuId === currentExpandedMenu) {
        tmpl.expandedMenu.set(null)
    } else {
        tmpl.expandedMenu.set(menuId)
    }
},

    'click #administrationMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #payrunsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #selfServiceMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    'click #reportsMenu': function(event, tmpl) {
        let menuId = $(event.currentTarget).attr('id')
        console.log(`menuId: `, menuId)

        let currentExpandedMenu = tmpl.expandedMenu.get()
        if(menuId === currentExpandedMenu) {
            tmpl.expandedMenu.set(null)
        } else {
            tmpl.expandedMenu.set(menuId)
        }
    },
    //------sub menus
    'click #buprofile': function(event, tmpl) {
      Router.go('bu.profile', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #budetails': function(event, tmpl) {
      Router.go('bu.details', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #paytypes': function(event, tmpl) {
      Router.go('paytypes', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #constantlist': function(event, tmpl) {
      Router.go('constant.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #currencylist': function(event, tmpl) {
      Router.go('currency.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #pensions': function(event, tmpl) {
      Router.go('pensions', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #taxes': function(event, tmpl) {
      Router.go('taxes', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #paygroups': function(event, tmpl) {
      Router.go('paygroups', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #paygrades': function(event, tmpl) {
      Router.go('paygrades', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #sapconfig': function(event, tmpl) {
      Router.go('sap.config', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #successfactorsconfig': function(event, tmpl) {
      Router.go('successfactors.config', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #saphanaconfig': function(event, tmpl) {
      Router.go('saphana.config', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #employees': function(event, tmpl) {
      Router.go('employees', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travelcities': function(event, tmpl) {
      Router.go('travelcities', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #flightroutes': function(event, tmpl) {
      Router.go('flightroutes', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #hotels': function(event, tmpl) {
      Router.go('hotels', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #airlines': function(event, tmpl) {
      Router.go('airlines', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #emailsettings': function(event, tmpl) {
      Router.go('emailsettings', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #budgets': function(event, tmpl) {
      Router.go('budgets', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #leaveentitlementlist': function(event, tmpl) {
      Router.go('leave.entitlement.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #leavebalances': function(event, tmpl) {
      Router.go('leave.balances.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #leavetypes': function(event, tmpl) {
      Router.go('leavetypes', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #employeetimeapprove': function(event, tmpl) {
      Router.go('employee.time.approve', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #projectlist': function(event, tmpl) {
      Router.go('project.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #payrunnew': function(event, tmpl) {
      Router.go('payrun.new', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #additionalpay': function(event, tmpl) {
      Router.go('additional.pay', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #newpayrun': function(event, tmpl) {
      Router.go('payrun.new', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #payruns': function(event, tmpl) {
      Router.go('payruns', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #payrunApprovalConfig': function(event, tmpl) {
      Router.go('payroll.approvalconfig', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #payrunApproval': function(event, tmpl) {
      Router.go('payroll.approval', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #treattravelrequest': function(event, tmpl) {
      Router.go('travelrequests.treatList', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travels2supervisors': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2supervisorindex', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travels2supervisorretirements': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2supervisorretirementindex', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #budgetholdertravels2approval': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2budgetholderindex', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travels2financeretirementapproval': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2financeretireindex', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    //--Self-Service sub menus
    'click #employeetime': function(event, tmpl) {
      Router.go('employee.time', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #leavelist': function(event, tmpl) {
      Router.go('leave.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #procurementrequisitionlist': function(event, tmpl) {
      Router.go('procurementrequisition.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #procurementrequisitionapprovalList': function(event, tmpl) {
      Router.go('procurementrequisition.approvalList', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travelrequestslist': function(event, tmpl) {
      Router.go('travelrequests.list', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travelrequestssupervisorlist': function(event, tmpl) {
      Router.go('travelrequests.supervisorlist', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travelrequestsbudgethoderlist': function(event, tmpl) {
      Router.go('travelrequests.budgetholderlist', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travelrequestsadminlist': function(event, tmpl) {
      Router.go('travelrequests.adminlist', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travelrequest2': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2index', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travelrequestsretirementlist': function(event, tmpl) {
      Router.go('travelrequest2.travelrequisition2retirementindex', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #travelrequestsbudgetholderretirementslist': function(event, tmpl) {
      Router.go('travelrequests.budgetholderretirementslist', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #travelrequestsapprovalList': function(event, tmpl) {
      Router.go('travelrequests.approvalList', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #payslip': function(event, tmpl) {
      Router.go('payslip', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #reportsnetpay': function(event, tmpl) {
      Router.go('reports.netpay', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportsnetpayannual': function(event, tmpl) {
      Router.go('reports.annualpay', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #reportstax': function(event, tmpl) {
      Router.go('reports.tax', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportstaxannual': function(event, tmpl) {
      Router.go('reports.annualtax', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    
    'click #reportspension': function(event, tmpl) {
      Router.go('reports.pension', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportspensionannual': function(event, tmpl) {
      Router.go('reports.annualpension', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },

    'click #reportscomprehensive': function(event, tmpl) {
      Router.go('reports.comprehensive', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportstimewriting': function(event, tmpl) {
      Router.go('reports.timewriting', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #employeesreport': function(event, tmpl) {
      Router.go('reports.employees', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #reportsprocurement': function(event, tmpl) {
      Router.go('reports.procurement', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportstravelrequisition': function(event, tmpl) {
      Router.go('reports.travelrequisition', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },


    'click #home': function(event, tmpl) {
      Router.go('home', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    }
});

Template.navigationModal.helpers({
    'context': function(){
        return Session.get('context');
    },
    'currentUserId': function() {
        return Meteor.userId();
    },
    'isMenuExpanded': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return menuId === currentExpandedMenuId
    },
    'isMenuExpandedFocusClass': function(menuId) {
        let currentExpandedMenuId = Template.instance().expandedMenu.get()
        return (menuId === currentExpandedMenuId) ? 'active' : ''
    },
    // 'hasProcurementRequisitionApproveAccess': function () {
    //     let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
    //     return canApproveProcurement;
    // },
    // 'isProcurementRequisitionActive': function () {
    //     // let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    //     // if(businessUnitCustomConfig) {
    //     //     return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
    //     // } else {
    //     //     return false
    //     // }
    //     return true;
    // },
    // 'hasTravelRequisitionApproveAccess': function () {
    //     let canApproveTrip = Core.hasTravelRequisitionApproveAccess(Meteor.userId());
    //     return canApproveTrip;
    // },
    // 'isTravelRequisitionActive': function () {
    //     // let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

    //     // if(businessUnitCustomConfig) {
    //     //     return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
    //     // } else {
    //     //     return false
    //     // }
    //     return true;
    // },


    hasLeaveApprovalAccess: function () {
      return Core.hasLeaveApprovalAccess(Meteor.userId());
    },

  hasProcurementRequisitionApproveAccess: function () {
      let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
      return canApproveProcurement;
  },
  isProcurementRequisitionActive: function () {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
      } else {
          return false
      }
  },
  isUserASupervisor: function() {
      let currentUser = Meteor.users.findOne(Meteor.userId())
      if(currentUser && currentUser.employeeProfile && currentUser.employeeProfile.employment) {
          let currentUserPosition = currentUser.employeeProfile.employment.position

          let numPositionsSupervising = EntityObjects.find({
                  otype: 'Position',
                  $or: [{'properties.supervisor' : currentUserPosition},
                      {'properties.alternateSupervisor': currentUserPosition}],
                  businessId: Session.get('context')
              }).count()
          return (numPositionsSupervising > 0)
      }
  },
  isUserADirectSupervisor: function() {
      if (Meteor.users.findOne({directSupervisorId: Meteor.userId()})){
          return true;
      } else {
          return false;
      }
  },
  isUserABudgetHolder: function() {

      if (Template.instance().isBudgetHolder.get() === "TRUE"){
          return true;
      }else{
          return false;
      }
  },
  isUserATravelFinanceApprover: function() {
      if (Template.instance().isFinanceApprover.get() === "TRUE"){
          return true;
      }else{
          return false;
      }
  },
  hasTravelRequisitionApproveAccess: function () {
      let canApproveTrip = Core.hasTravelRequisitionApproveAccess(Meteor.userId());
      return canApproveTrip;
  },
  isAdvancedTravelEnabled: function () {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isAdvancedTravelEnabled
      } else {
          return false
      }
  },
  isTravelRequisitionActive: function () {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
      } else {
          return false
      }
  },
  hasPayRulesManageAccess: function () {
      let hasPayrulesManageAccess = Core.hasPayRulesManageAccess(Meteor.userId());
      return hasPayrulesManageAccess;
  },

  hasRunPayrollManageAccess: function () {
      return Core.hasRunPayrollManageAccess(Meteor.userId());
  },
  hasPayrollAdditionalPaymentsManageAccess: function () {
      return Core.hasPayrollAdditionalPaymentsManageAccess(Meteor.userId());
  },
  hasPayrollResultsViewAccess: function () {
      return Core.hasPayrollResultsViewAccess(Meteor.userId());
  },
  hasPayrollApprovalConfigAccess: function () {
      return Core.hasPayrollApprovalConfigAccess(Meteor.userId());
  },
  // hasPayrollApprovalManageAccess: function () {
  //     return Core.hasPayrollApprovalManageAccess(Meteor.userId());
  // },

  hasPayrollReportsViewAccess: function () {
      let hasPayrollReportsViewAccess = Core.hasPayrollReportsViewAccess(Meteor.userId());
      return hasPayrollReportsViewAccess;
  },
  hasAuditReportsViewAccess: function () {
      let hasAuditReportsViewAccess = Core.hasAuditReportsViewAccess(Meteor.userId());
      return hasAuditReportsViewAccess;
  },
  hasProcurementReportsViewAccess: function () {
      return Core.hasProcurementReportsViewAccess(Meteor.userId());
  },
  isSapBusinessOneIntegrationEnabled: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapBusinessOneIntegrationEnabled
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
  isSapHanaEnabled: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isSapHanaIntegrationEnabled
    } else {
        return true
    }
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
  isTimeWritingReportsActive: () => {
    let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
    if(businessUnitCustomConfig) {
        return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTimeWritingReportsActive
    } else {
        return true
    }
  },
  hasSuccessfactorsManageAccess: () => {
    return Core.hasSuccessfactorManagesAccess(Meteor.userId());
  },
  hasSapHanaManageAccess: () => {
    return Core.hasSapHanaManageAccess(Meteor.userId());
  },

    'payGradeLabel': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabel
        } else {
            return "Pay Grade"
        }
    },
    'payGradeLabelPlural': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.payGradeLabelPlural
        } else {
            return "Pay Grades"
        }
    },
    'canApprovePayroll': function() {
          let userId = Meteor.userId()
          let payrollApprovalConfig = Template.instance().payrollApprovalConfig.get()
          if(payrollApprovalConfig) {
              let approvers = payrollApprovalConfig.approvers
              if(approvers && approvers.length > 0) {
                  let currentUserIsApprover = _.find(approvers, anApproverId => {
                      return anApproverId === userId
                  })
                  return (currentUserIsApprover) ? true : false
              }
          }
      },
      'isLeaveAccrualByEntitlement': function() {
          let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
          if(businessUnitCustomConfig) {
              return businessUnitCustomConfig.leaveDaysAccrual === 'FixedLeaveEntitlement'
          }
      },
      'isTimeTypeEnabled': function() {
          let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

          if(businessUnitCustomConfig) {
              return businessUnitCustomConfig.isTimeTypeEnabled
          }
      },
      'isHmoSetupEnabled': function() {
          let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

          if(businessUnitCustomConfig) {
              return businessUnitCustomConfig.isHmoSetupEnabled
          }
      },
      'isLoanEnabled': function() {
          let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

          if(businessUnitCustomConfig) {
              return businessUnitCustomConfig.isLoanEnabled
          }
      },
    'isTravelBudgetsEnabled': function() {
      let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

      if(businessUnitCustomConfig) {
          return businessUnitCustomConfig.isTravelBudgetsEnabled
      }
    },
    'isTravelCitiesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isTravelCitiesEnabled
        }
    },
    'isAirlinesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isAirlinesEnabled
        }
    },
    'isAHotelsEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isAHotelsEnabled
        }
    },
    'isFlightRoutesEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isFlightRoutesEnabled
        }
    },
    'isEmailSettingsEnabled': function() {
        let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        if(businessUnitCustomConfig) {
            return businessUnitCustomConfig.isEmailSettingsEnabled
        }
    }
});

Template.navigationModal.onCreated(function () {
    let self = this

    //--
    self.expandedMenu = new ReactiveVar()
    //--
    self.businessUnitCustomConfig = new ReactiveVar()
    self.payrollApprovalConfig = new ReactiveVar();

    self.isBudgetHolder = new ReactiveVar();
    self.isFinanceApprover = new ReactiveVar();


    self.autorun(function(){
        let businessUnitId = Session.get('context');
        // console.log(`businessUnitId`, businessUnitId)

        let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());

        if(customConfigSub.ready()) {
            self.businessUnitCustomConfig.set(BusinessUnitCustomConfigs.findOne({businessId: businessUnitId}))
            // console.log(`mobile navigation modal: businessUnitCustomConfig: ${JSON.stringify(self.businessUnitCustomConfig.get())}`)
        }
    })
});


Template.navigationModal.onRendered(function () {
});
