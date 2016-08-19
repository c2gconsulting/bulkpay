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
    controller: 'HomeController',
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

Router.route('/business-units', {
    name: 'businessunits',
    controller: 'BusinessUnitController',
    action: 'home',
    where: 'client'
});
Router.route('/businessunit/:_id', {
    name: 'bu.details',
    controller: 'BusinessUnitController',
    action: 'show',
    where: 'client'
})



Router.route('divisions', {
  name: 'divisions',
  controller: 'DivisionsController',
  where: 'client'
});

Router.route('/division/:_id', {
    name: 'division.show',
    controller: 'DivisionsController',
    action: 'show',
    where: 'client'
})

Router.route('departments', {
  name: 'departments',
  controller: 'DepartmentsController',
  where: 'client'
});

Router.route('positions', {
  name: 'positions',
  controller: 'PositionsController',
  where: 'client'
});

Router.route('jobs', {
  name: 'jobs',
  controller: 'JobsController',
  where: 'client'
});

Router.route('paygroups', {
  name: 'paygroups',
  controller: 'PaygroupsController',
  where: 'client'
});

Router.route('paytypes', {
  name: 'paytypes',
  controller: 'PaytypesController',
  where: 'client'
});

Router.route('paygrades', {
  name: 'paygrades',
  controller: 'PaygradesController',
  where: 'client'
});

Router.route('taxes', {
  name: 'taxes',
  controller: 'TaxesController',
  where: 'client'
});

Router.route('pensions', {
  name: 'pensions',
  controller: 'PensionsController',
  where: 'client'
});

Router.route('employees', {
  name: 'employees',
  controller: 'EmployeesController',
  where: 'client'
});