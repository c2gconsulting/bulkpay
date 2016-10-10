/*
 * Main Routing and Security Configurations
 * uses iron:router package.
 */
Router.configure({
    notFoundTemplate: "NotFound",
    loadingTemplate: "Loading",

    onRun: function () {
        $(window).scrollTop(0);
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

/*
 Router.route('/login', {
 name: 'login',
 layoutTemplate: 'ExtLayout',
 template: 'Login'
 });*/

Router.route('/reset-my-password', {
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

Router.route('/business/:_id/division', {
    name: 'divisions',
    controller: 'DivisionsController',
    where: 'client'
});

Router.route('/business/:_id/departments', {
    name: 'departments',
    controller: 'DepartmentsController',
    where: 'client'
});

Router.route('/business/:_id/positions', {
    name: 'positions',
    controller: 'PositionsController',
    where: 'client'
});

Router.route('/business/:_id/jobs', {
    name: 'jobs',
    controller: 'JobsController',
    where: 'client'
});

Router.route('/business/:_id/paygroups', {
    name: 'paygroups',
    controller: 'PaygroupsController',
    where: 'client'
});

Router.route('/business/:_id/paytypes', {
    name: 'paytypes',
    controller: 'PaytypesController',
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

Router.route('/business/:_id/employee/new', {
    name: 'employees.create',
    controller: 'EmployeesController',
    action: 'create',
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

Router.route('/business/:_id/payrun/new', {
  name: 'payrun.new',
  controller: 'PayrunController',
  where: 'client'
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