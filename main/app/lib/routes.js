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
Router.route('/businessunit/:id', {
    name: 'bu.details',
    controller: 'BusinessUnitController',
    action: 'show',
    where: 'client'
})

