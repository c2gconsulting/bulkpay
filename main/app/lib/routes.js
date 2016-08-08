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

// orders routes
Router.route('/orders/create', {
  name: 'orders.create',
  controller: 'HomeController',
  action: 'createOrder',
  where: 'client'
});

Router.route('/orders', {
  name: 'orders.list',
  controller: 'HomeController',
  action: 'listOrders',
  where: 'client'
});

Router.route('/orders/:_id', {
  name: 'orders.detail',
  controller: 'OrdersController',
  action: 'detail',
  where: 'client'
});

Router.route('/orders/:_id/edit', {
  name: 'orders.edit',
  controller: 'OrdersController',
  action: 'edit',
  where: 'client'
});

Router.route('/orders/:_id/print', {
  name: 'orders.print',
  controller: 'OrdersController',
  action: 'print',
  where: 'client'
});

Router.route('/orders/:_id/warehouse_slip', {
  name: 'orders.warehouseSlip',
  controller: 'OrdersController',
  action: 'warehouseSlip',
  where: 'client'
});

// returns routes
Router.route('/returns/:_id/create', {
  name: 'returns.create',
  controller: 'OrdersController',
  action: 'createReturnOrder',
  where: 'client'
});

Router.route('/returns', {
  name: 'returns.list',
  controller: 'HomeController',
  action: 'listReturns',
  where: 'client'
});

Router.route('/returns/:_id', {
  name: 'returns.detail',
  controller: 'ReturnsController',
  action: 'detail',
  where: 'client'
});
Router.route('/returns/:_id/print', {
  name: 'returns.print',
  controller: 'ReturnsController',
  action: 'print',
  where: 'client'
});

// invoices routes
Router.route('/invoices/:_id/create', {
  name: 'invoices.create',
  controller: 'OrdersController',
  action: 'createInvoice',
  where: 'client'
});

Router.route('/invoices', {
  name: 'invoices.list',
  controller: 'HomeController',
  action: 'listInvoices',
  where: 'client'
});

Router.route('/invoices/:_id', {
  name: 'invoices.detail',
  controller: 'InvoicesController',
  action: 'detail',
  where: 'client'
});

Router.route('/invoices/:_id/print', {
  name: 'invoices.print',
  controller: 'InvoicesController',
  action: 'print',
  where: 'client'
});

// distributor routes
Router.route('/distributors', {
  name: 'distributors.list',
  controller: 'HomeController',
  action: 'listDistributors',
  where: 'client'
});

Router.route('/distributors/create', {
  name: 'distributors.create',
  controller: 'DistributorsController',
  action: 'create',
  where: 'client'
});

Router.route('/distributors/:_id', {
  name: 'distributors.detail',
  controller: 'DistributorsController',
  action: 'detail',
  where: 'client'
});

Router.route('/distributors/:_id/edit', {
  name: 'distributors.edit',
  controller: 'DistributorsController',
  action: 'edit',
  where: 'client'
});

Router.route('/distributors/:_id/print', {
  name: 'distributors.print',
  controller: 'DistributorsController',
  action: 'print',
  where: 'client'
});

// accounts routes
Router.route('/accounts/:_id/detail', {
  name: 'account.detail',
  controller: 'AccountsController',
  action: 'accountDetail',
  where: 'client'
});

Router.route('/accounts/:_id/edit', {
  name: 'account.edit',
  controller: 'AccountsController',
  action: 'accountEdit',
  where: 'client'
});

Router.route('/accounts', {
  name: 'accounts.list',
  controller: 'AccountsController',
  action: 'listAccounts',
  where: 'client'
});

Router.route('/accounts/preferences', {
  name: 'accounts.preferences',
  controller: 'AccountsController',
  action: 'preferences',
  where: 'client'
});

// promotions routes
Router.route('/promotions', {
  name: 'promotions.list',
  controller: 'HomeController',
  action: 'listPromotions',
  where: 'client'
});

Router.route('/promotions/create', {
  name: 'promotions.create',
  controller: 'PromotionsController',
  action: 'createPromotion',
  where: 'client'
});

Router.route('/promotions/:_id', {
  name: 'promotions.detail',
  controller: 'PromotionsController',
  action: 'detail',
  where: 'client'
});

Router.route('/promotions/:_id/edit', {
  name: 'promotions.edit',
  controller: 'PromotionsController',
  action: 'edit',
  where: 'client'
});

Router.route('/rebates', {
  name: 'rebates.list',
  controller: 'HomeController',
  action: 'listRebates',
  where: 'client'
});

Router.route('/reports', {
  name: 'reports.home',
  controller: 'ReportsController',
  action: 'home',
  where: 'client'
});

Router.route('/reports/sales', {
  name: 'reports.sales',
  controller: 'ReportsController',
  action: 'sales',
  where: 'client'
});

Router.route('/reports/salesorders', {
  name: 'reports.salesorders',
  controller: 'ReportsController',
  action: 'salesOrders',
  where: 'client'
});

Router.route('/reports/saleshistory', {
  name: 'reports.saleshistory',
  controller: 'ReportsController',
  action: 'salesHistory',
  where: 'client'
});

Router.route('/reports/returns', {
  name: 'reports.returns',
  controller: 'ReportsController',
  action: 'returns',
  where: 'client'
});

Router.route('/reports/returnorders', {
  name: 'reports.returnorders',
  controller: 'ReportsController',
  action: 'returnOrders',
  where: 'client'
});

Router.route('/reports/returnshistory', {
  name: 'reports.returnshistory',
  controller: 'ReportsController',
  action: 'returnsHistory',
  where: 'client'
});

Router.route('/reports/paymentshistory', {
  name: 'reports.paymentshistory',
  controller: 'ReportsController',
  action: 'paymentsHistory',
  where: 'client'
});

Router.route('/reports/invoicehistory', {
  name: 'reports.invoicehistory',
  controller: 'ReportsController',
  action: 'invoiceHistory',
  where: 'client'
});

Router.route('/reports/rebateshistory', {
  name: 'reports.rabateshistory',
  controller: 'ReportsController',
  action: 'rebatesHistory',
  where: 'client'
});


// profile routes
Router.route('/profile/:_id/detail', {
  name: 'profile.detail',
  controller: 'AccountsController',
  action: 'profileDetail',
  where: 'client'
});

Router.route('/profile/:_id/edit', {
  name: 'profile.edit',
  controller: 'AccountsController',
  action: 'profileEdit',
  where: 'client'
});

// purchase order routes

Router.route('/purchaseorders/list', {
  name: 'purchaseOrders.list',
  controller: 'HomeController',
  action: 'listPurchaseOrders',
  where: 'client'
});

Router.route('/purchaseorders/create', {
  name: 'purchaseOrders.create',
  controller: 'HomeController',
  action: 'createPurchaseOrder',
  where: 'client'
});

Router.route('/purchaseorders/:_id', {
  name: 'purchaseOrders.detail',
  controller: 'PurchaseOrdersController',
  action: 'detail',
  where: 'client'
});

Router.route('/purchaseorders/:_id/receive', {
  name: 'purchaseOrders.receive',
  controller: 'PurchaseOrdersController',
  action: 'receivePurchaseOrder',
  where: 'client'
});

Router.route('/purchaseorders/:_id/edit', {
  name: 'purchaseOrders.edit',
  controller: 'PurchaseOrdersController',
  action: 'edit',
  where: 'client'
});


Router.route('/suppliers/create', {
  name: 'suppliers.create',
  controller: 'SuppliersController',
  action: 'create',
  where: 'client'
});

Router.route('/suppliers', {
  name: 'suppliers.list',
  controller: 'HomeController',
  action: 'listSuppliers',
  where: 'client'
});



Router.route('/locations', {
  name: 'locations.list',
  controller: 'HomeController',
  action: 'listLocations',
  where: 'client'
});

// Stock Transfer routes

Router.route('/transfers/list', {
  name: 'transfers.list',
  controller: 'HomeController',
  action: 'listTransfers',
  where: 'client'
});


Router.route('/transfers/create', {
  name: 'transfers.create',
  controller: 'HomeController',
  action: 'createTransfers',
  where: 'client'
});

Router.route('/transfers/:_id', {
  name: 'transfers.detail',
  controller: 'TransfersController',
  action: 'detail',
  where: 'client'
});


/*
* Stock Adjustment routes
* */

Router.route('/adjustments/list', {
  name: 'stockAdjustments.list',
  controller: 'HomeController',
  action: 'listAdjustments',
  where: 'client'
});

Router.route('/adjustments/create', {
  name: 'stockAdjustments.create',
  controller: 'AdjustmentsController',
  action: 'create',
  where: 'client'
});

Router.route('/adjustments/:_id', {
  name: 'stockAdjustments.detail',
  controller: 'AdjustmentsController',
  action: 'detail',
  where: 'client'
});

