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
      'click #budgets': function(event, tmpl) {
        Router.go('budgets', {_id: Session.get('context')})
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


    'click #employees': function(event, tmpl) {
      Router.go('employees', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #leaveentitlementlist': function(event, tmpl) {
      Router.go('leave.entitlement.list', {_id: Session.get('context')})
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
    'click #payruns': function(event, tmpl) {
      Router.go('payruns', {_id: Session.get('context')})
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
    'click #travelrequestsretirementlist': function(event, tmpl) {
      Router.go('travelrequests.retirementlist', {_id: Session.get('context')})
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
    'click #reportstax': function(event, tmpl) {
      Router.go('reports.tax', {_id: Session.get('context')})
      Modal.hide('navigationModal');
      event.preventDefault();
    },
    'click #reportspension': function(event, tmpl) {
      Router.go('reports.pension', {_id: Session.get('context')})
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
    'hasProcurementRequisitionApproveAccess': function () {
        let canApproveProcurement = Core.hasProcurementRequisitionApproveAccess(Meteor.userId());
        return canApproveProcurement;
    },
    'isProcurementRequisitionActive': function () {
        // let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()
        // if(businessUnitCustomConfig) {
        //     return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isProcurementRequisitionActive
        // } else {
        //     return false
        // }
        return true;
    },
    'hasTravelRequisitionApproveAccess': function () {
        let canApproveTrip = Core.hasTravelRequisitionApproveAccess(Meteor.userId());
        return canApproveTrip;
    },
    'isTravelRequisitionActive': function () {
        // let businessUnitCustomConfig = Template.instance().businessUnitCustomConfig.get()

        // if(businessUnitCustomConfig) {
        //     return businessUnitCustomConfig.isActive && businessUnitCustomConfig.isTravelRequisitionActive
        // } else {
        //     return false
        // }
        return true;
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
    }
});

Template.navigationModal.onCreated(function () {
    let self = this

    //--
    self.expandedMenu = new ReactiveVar()
    //--

    self.businessUnitCustomConfig = new ReactiveVar()

    self.autorun(function(){
        let businessUnitId = Session.get('context');
        // console.log(`businessUnitId`, businessUnitId)

        let customConfigSub = self.subscribe("BusinessUnitCustomConfig", businessUnitId, Core.getTenantId());

        if(customConfigSub.ready()) {
            self.businessUnitCustomConfig.set(BusinessUnitCustomConfigs.findOne({businessId: businessUnitId}))
            // console.log(`businessUnitCustomConfig: ${JSON.stringify(self.businessUnitCustomConfig.get())}`)
        }
    })
});


Template.navigationModal.onRendered(function () {
});
