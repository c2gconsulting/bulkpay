/*
 * Main Routing and Security Configurations
 * uses iron:router package.
 */
Router.configure({
    notFoundTemplate: "NotFound",
    loadingTemplate: "Loading",

    onRun: function () {
        //$(window).scrollTop(0);
        //Core.clearActionView();
        this.next();
    }
});

/*
 * Main Useraccounts config
 */
AccountsTemplates.configure({
    defaultLayout: 'ExtLayout',
    showResendVerificationEmailLink: true,
    showForgotPasswordLink: true,
    enablePasswordChange: true
});

// Account routes
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('enrollAccount');
AccountsTemplates.configureRoute('verifyEmail');
AccountsTemplates.configureRoute('resendVerificationEmail');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('changePwd');


// default home routes
Router.route('/', {
    name: 'home',
    controller: 'BusinessUnitController',
    action: 'home',
    where: 'client'
});

// Router.route('/sendOneOffEnrollmentEmails', function() {
//     console.log('routes.js file ... inside sendOneOffEnrollmentEmails')

//     let users =  Meteor.users.find({"businessIds": {"$in" : ["udrayHAGvXXDgzzGf"]}}).fetch();
//     console.log(`Num users: ${users.length}`)
//     let successfulEmailsSent = 0

//     let userEmailsToSendTo = ["roy.abdallah@deltatekoffshore.com"]

//     for (let aUser of users) {
//         try {
//             if(userEmailsToSendTo.indexOf(aUser.emails[0].address) > -1) {
//               console.log(`aUser id: ${aUser._id} ... Email: ${aUser.emails[0].address}`)
//               Accounts.sendEnrollmentEmail(aUser._id, aUser.emails[0].address);

//               successfulEmailsSent += 1
//               console.log(`Email sent successfully`)
//             }
//         } catch(e) {
//            console.log(`Exception : ${e.message}`)
//         }
//     }
//     console.log(`successfulEmailsSent: ${successfulEmailsSent}`)

//     this.response.write("All emails sent")
//     this.response.end()
// }, {where: 'server'});

let getPositionParentsText = function(position) {
    var parentsText = ''
    if(position.parentId) {
    	let possibleParent = EntityObjects.findOne({_id: position.parentId})

        if(possibleParent) {
            parentsText += possibleParent.name

            if(possibleParent.parentId) {
		    	let possibleParent2 = EntityObjects.findOne({_id: possibleParent.parentId})

                if(possibleParent2) {
                    parentsText += ' >> ' + possibleParent2.name
                    return parentsText
                } return ''
            } else return parentsText
        } else return ''
    } else return ''
};

Router.route('/getStats', function() {
    console.log('routes.js file ... inside getStats')
    let allDaarUsers = Meteor.users.find({businessIds: 'tgC7zYJf9ceSBmoT9'}).fetch()
    console.log(`Num allDaarUsers: `, allDaarUsers.length)
    
    let numDaarUsersWithRealPassword = 0
    let numDaarUsersWithDefaultPassword = 0
    let daarUsersWithRealPassword = []
    let daarUsersWithDefaultPassword = []

    let hashedDefaultPassword = Package.sha.SHA256("123456") 
    let defaultPassword = {digest: hashedDefaultPassword, algorithm: 'sha-256'};

    let payGrades = {

    }

    allDaarUsers.forEach((aDaarUser, userIndex) => {
        // console.log(`Looping: `, userIndex)
        try {
            if(userIndex < 1055) {
                let defaultLoginResult = Accounts._checkPassword(aDaarUser, defaultPassword);  

                let firstName = aDaarUser.profile.firstname
                let lastName = aDaarUser.profile.lastname
                let email = aDaarUser.emails[0] ? aDaarUser.emails[0].address : ''
                let paygradeId = aDaarUser.employeeProfile.employment.paygrade || ""
                let paygrade = payGrades[paygradeId]
                if(!paygrade) {
                    let paygradeData = PayGrades.findOne(paygradeId)
                    if(paygradeData) {
                        payGrades[paygradeId] = paygradeData
                        paygrade = paygradeData
                    }
                }

                let parentsText = ''
                let employeePositionId = aDaarUser.employeeProfile.employment.position
                if(employeePositionId) {
                    let employeePosition = EntityObjects.findOne({_id: employeePositionId}) 
                    if(employeePosition) {
                        parentsText = getPositionParentsText(employeePosition)
                    }
                } else {
                    console.log('Employee with id: ' + aDaarUser._id + ", has no position id")
                }

                if(defaultLoginResult.error) {
                    daarUsersWithRealPassword.push({
                        firstName : firstName,
                        lastName: lastName,
                        email: email,
                        parents: parentsText,
                        payGrade: paygrade ? paygrade.code : ''
                    })
                    numDaarUsersWithRealPassword += 1           
                } else {
                    daarUsersWithDefaultPassword.push({
                        firstName : firstName,
                        lastName: lastName,
                        email: email,
                        parents: parentsText,
                        payGrade: paygrade ? paygrade.code : ''
                    })
                    numDaarUsersWithDefaultPassword += 1
                }
            } else {
                console.log('Reached the upper limit')
            }
        } catch(e) {
            console.log("Exception: ", e.message)
        }
    })
    //--
    console.log(`daarUsersWithRealPassword: \n${JSON.stringify(daarUsersWithRealPassword)}\n`)
    console.log(`daarUsersWithDefaultPassword: \n${JSON.stringify(daarUsersWithDefaultPassword)}\n\n`)
    //--
    console.log(`numDaarUsersWithRealPassword: ${numDaarUsersWithRealPassword}\n`)
    console.log(`numDaarUsersWithDefaultPassword: ${numDaarUsersWithDefaultPassword}\n`)
    console.log(`All done!`)

    // var theResponse = {daarUsersWithRealPassword, daarUsersWithDefaultPassword, numDaarUsersWithRealPassword, numDaarUsersWithDefaultPassword}
    // this.response.write(JSON.stringify(theResponse))

    // this.response.write({daarUsersWithRealPassword, daarUsersWithDefaultPassword, numDaarUsersWithRealPassword, numDaarUsersWithDefaultPassword})
    this.response.end()
}, {where: 'server'});

/*
 Router.route('/login', {
 name: 'login',
 layoutTemplate: 'ExtLayout',
 template: 'Login'
 });*/

Router.route('/send-reset-password-link', {
    name: 'send.reset-passwordlink',
    layoutTemplate: 'ExtLayout',
    template: 'SendPasswordResetLink'
});

Router.route('/resetPassword/:token', {
    name: 'reset.password',
    layoutTemplate: 'ExtLayout',
    template: 'ResetMyPassword'
});

Router.route('/business/:_id', {
    name: 'bu.details',
    controller: 'BusinessUnitController',
    action: 'show',
    where: 'client'
});
Router.route('/business/:_id/payslip', {
    name: 'payslip',
    controller: 'PayslipController',
    action: 'showSelfPaySlips',
    where: 'client'
});

Router.route('/business/:_id/orgchart', {
    name: 'orgchart',
    controller: 'OrgChartController',
    where: 'client'

});
Router.route('/business/:_id/profile', {
    name: 'bu.profile',
    controller: 'BusinessUnitProfileController',
    where: 'client'

});

Router.route('/business/:_id/paygroups', {
    name: 'paygroups',
    controller: 'PaygroupsController',
    where: 'client'
});

Router.route('/business/:_id/entity/:id', {
    name: 'entity',
    controller: 'EntityController',
    where: 'client'
});

Router.route('/business/:_id/paytypes', {
    name: 'paytypes',
    controller: 'PaytypesController',
    where: 'client'
});

Router.route('/business/:_id/constants', {
    name: 'constant.list',
    controller: 'ConstantsController',
    where: 'client'
});

Router.route('/business/:_id/currencies', {
    name: 'currency.list',
    controller: 'CurrenciesController',
    where: 'client'
});

Router.route('/business/:_id/leavetypes', {
    name: 'leavetypes',
    controller: 'LeaveTypesController',
    action: 'list',
    where: 'client'
});

Router.route('/business/:_id/paygrades', {
    name: 'paygrades',
    controller: 'PaygradesController',
    where: 'client'
});

Router.route('/business/:_id/taxes', {
    name: 'taxes',
    controller: 'TaxesController',
    where: 'client'
});

Router.route('/business/:_id/pensions', {
    name: 'pensions',
    controller: 'PensionsController',
    where: 'client'
});

Router.route('/business/:_id/employees', {
    name: 'employees',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/:employeeId/profile', {
    name: 'employee.profile',
    controller: 'EmployeeProfileController',
    where: 'client'
});

Router.route('/business/:_id/employee/new', {
    name: 'employees.create',
    controller: 'EmployeesController',
    action: 'create',
    where: 'client'
});
Router.route('/business/:_id/employee/time', {
    name: 'employee.time',
    controller: 'EmployeesController',
    action: 'time',
    where: 'client'
});
Router.route('/business/:_id/employee/time/approve', {
    name: 'employee.time.approve',
    controller: 'EmployeesController',
    action: 'approveTime',
    where: 'client'
});

Router.route('/business/:_id/projects', {
    name: 'project.list',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/expense', {
    name: 'employee.expense',
    controller: 'EmployeesController',
    action: 'expense',
    where: 'client'
});

Router.route('tenant/signup', {
    name: 'new.tenant',
    controller: 'TenantsController',
    where: 'client'
});

Router.route('/business/:_id/loans/new', {
    name: 'loans.new',
    controller: 'LoansController',
    where: 'client',
    action: 'create'
});

Router.route('/business/:_id/loans', {
    name: 'loans.manage',
    controller: 'LoansController',
    where: 'client'
});

Router.route('/business/:_id/oneoffs', {
  name: 'oneoff',
  controller: 'OneoffController',
  where: 'client'
});

Router.route('/business/:_id/additional', {
    name: 'additional.pay',
    controller: 'AdditionalController',
    where: 'client'
});

Router.route('/business/:_id/payrun/new', {
  name: 'payrun.new',
  controller: 'PayrunController',
  where: 'client'
});

Router.route('/business/:_id/sap/config', {
  name: 'sap.config',
  controller: 'SAPConfigController',
  where: 'client',
  action: 'showConfig'
});

Router.route('/business/:_id/payruns', {
  name: 'payruns',
  controller: 'PayrunController',
  where: 'client'
});
Router.route('/tenant/settings', {
    name: 'tenant.settings',
    controller: 'HomeController',
    action: 'settings',
    where: 'client'
});

Router.route('/business/:_id/employee/leaves', {
    name: 'leave.list',
    controller: 'EmployeesController',
    where: 'client'
});
Router.route('/business/:_id/employee/leave/entitlements', {
    name: 'leave.entitlement.list',
    controller: 'LeaveEntitlementController',
    action: 'showLeaveEntitlementsList',
    where: 'client'
});
Router.route('/business/:_id/employee/procurementrequisitions', {
    name: 'procurementrequisition.list',
    controller: 'ProcurementRequisitionController',
    action: 'showProcurementRequisitionsList',
    where: 'client'
});
Router.route('/business/:_id/employee/procurementrequisitions/approvalslist', {
    name: 'procurementrequisition.approvalList',
    controller: 'ProcurementRequisitionApprovalListController',
    action: 'showProcurementRequisitionApprovalList',
    where: 'client'
});


Router.route('/business/:_id/reports/netpay', {
    name: 'reports.netpay',
    controller: 'ReportsController',
    action: 'netpay',
    where: 'client'
});

Router.route('/business/:_id/reports/tax', {
    name: 'reports.tax',
    controller: 'ReportsController',
    action: 'tax',
    where: 'client'
});

Router.route('/business/:_id/reports/pension', {
    name: 'reports.pension',
    controller: 'ReportsController',
    action: 'pension',
    where: 'client'
});

Router.route('/business/:_id/reports/comprehensive', {
    name: 'reports.comprehensive',
    controller: 'ReportsController',
    action: 'comprehensive',
    where: 'client'
});

Router.route('/business/:_id/reports/timewriting', {
    name: 'reports.timewriting',
    controller: 'ReportsController',
    action: 'timewriting',
    where: 'client'
});
