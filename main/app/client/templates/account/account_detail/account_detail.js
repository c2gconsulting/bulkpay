/*****************************************************************************/
/* AccountDetail: Event Handlers */
/*****************************************************************************/
Template.AccountDetail.events({
    'change .onoffswitch-checkbox': function(e, tmpl) {
        let notificationsType  = e.currentTarget.dataset.field;
        let notifications = Template.instance().notifications.get('notifications');
        let value = e.currentTarget.value;
        if (e.currentTarget.type === 'checkbox') value = e.currentTarget.checked;
        if (notifications && notifications.hasOwnProperty(notificationsType)){
            notifications[notificationsType] = value;
            Template.instance().notifications.set('notifications', notifications);
            let message = notificationsType.replace(/([a-z](?=[A-Z]))/g, '$1 ');
            let status = value ? "enabled" : "disabled";
            Meteor.call("account/updateNotifications", notifications, this._id, function (err, res) {
                if (err){
                    console.log(err)
                    toastr.error(err, 'Error')
                } else {
                    toastr.success(`${toTitleCase(message)} notifications ${status}`, 'Success')
                }
            });
        } else {
            console.log(notificationsType, "not found")
        }
    }
});

/*****************************************************************************/
/* AccountDetail: Helpers */
/*****************************************************************************/
Template.AccountDetail.helpers({
    assigneeCode: function () {
        if (this.salesProfile && this.salesProfile.originCode) return this.salesProfile.originCode;
        return "None"
    },
    email: function () {
        return this.emails[0].address
    },

    label: function(string){
        if (this.valueOf() === "ALL_ACCESS"){
            return "ALL ACCESS"
        }
        let location = Locations.findOne(string);
        if (location) return location.name ? location.name : " ";
        let orderType = OrderTypes.findOne({code: Number(string)});
        if (orderType) return  orderType.name ? orderType.name : " "
    },

    customerGroup: function(){
        if (this.valueOf() === "ALL_ACCESS"){
            return "ALL ACCESS"
        }
        let customerGroup =  CustomerGroups.findOne({code: this.valueOf()});
        return customerGroup ? customerGroup.name : " "
    },

    globalPermissions: function () {
        let permissions = [];
        let global = Template.instance().roles.get('globalRoles');
        _.each(global, function (role) {
            if (role === Core.Permissions.ADMIN_ALL[0] || role ===  Core.Permissions.VIEW_ALL[0]){
                permissions.push(role)
            }
        });
        return permissions
    },

    promotionsPermissions: function () {
        return Template.instance().roles.get('promotionRoles');
    },

    rebatesPermissions: function () {
        return Template.instance().roles.get('rebateRoles');
    },
    permissionLabel: function (permission) {
        if (permission === "ALL_ACCESS") return "ALL ACCESS";
        return Core.PermissionNames[permission];
    },
    manageOrders: function(){
        return Template.instance().roles.get('manageOrderRoles');
    },

    viewOrders: function(){
        return Template.instance().roles.get('viewOrderRoles');
    },

    manageInvoices: function(){
        return Template.instance().roles.get('manageInvoiceRoles');
    },

    viewInvoices: function(){
        return Template.instance().roles.get('viewInvoiceRoles');
    },

    manageCustomers: function(){
        return Template.instance().roles.get('manageCustomerRoles');
    },

    viewCustomers: function(){
        return Template.instance().roles.get('viewCustomerRoles');
    },

    manageReturns: function(){
        return Template.instance().roles.get('manageReturnOrderRoles');
    },

    approveReturns: function(){
        return Template.instance().roles.get('approveReturnOrderRoles');
    },

    viewReturns: function(){
        return Template.instance().roles.get('viewReturnOrderRoles');
    },

    approveOrders: function () {
        return Template.instance().roles.get('approveOrderRoles');
    },

    avatar: function () {
        return UserImages.findOne({owner: this._id})
    },
    notifications: function(){
        return Template.instance().notifications.get('notifications');
    },
    approveOrderTypes: function () {
        return Template.instance().roles.get('approveOrderTypeRoles');
    }

});

/*****************************************************************************/
/* AccountDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountDetail.onCreated(function () {
    let instance = this;
    let self =this;
    self.roles = new ReactiveDict();
    self.notifications = new ReactiveDict();
    instance.totalMonthOrders = new ReactiveDict();


    if (!Session.get('userHistorySortBy')) {
        Session.set('userHistorySortBy', 'issuedAt');
        Session.set('userHistorySortDirection', -1);
    }


    if (!self.roles.get('manageOrderRoles')){
        let manageOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageOrders = _.some(value, function(r) {
                return r == Core.Permissions.ORDERS_MANAGE;
            });
            if(canManageOrders){
                if (key === Roles.GLOBAL_GROUP){
                    manageOrderRoles = ["ALL_ACCESS"]
                } else {
                    manageOrderRoles.push(key)
                }
            }
        });
        self.roles.set('manageOrderRoles', manageOrderRoles)
    }

    if (!self.roles.get('viewOrderRoles')){
        let viewOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canViewOrders = _.some(value, function(r) {
                return r == Core.Permissions.ORDERS_VIEW[0];
            });
            if(canViewOrders){
                if (key === Roles.GLOBAL_GROUP){
                    viewOrderRoles = ["ALL_ACCESS"]
                } else {
                    viewOrderRoles.push(key)
                }
            }
        });
        self.roles.set('viewOrderRoles', viewOrderRoles)
    }

    if (!self.roles.get('approveOrderRoles')){
        let approveOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canApproveOrders = _.some(value, function(r) {
                return r == Core.Permissions.ORDERS_APPROVE;
            });
            if(canApproveOrders){
                if (key === Roles.GLOBAL_GROUP){
                    approveOrderRoles = ["ALL_ACCESS"]
                } else {
                    approveOrderRoles.push(key)
                }
            }
        });
        self.roles.set('approveOrderRoles', approveOrderRoles)
    }

    if (!self.roles.get('approveOrderTypeRoles')){
        let approveOrderTypeRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canApproveOrderTypes = _.some(value, function(r) {
                return r == Core.Permissions.ORDERTYPES_APPROVE;
            });
            if(canApproveOrderTypes){
                if (key === Roles.GLOBAL_GROUP){
                    approveOrderTypeRoles = ["ALL_ACCESS"]
                } else {
                    approveOrderTypeRoles.push(key)
                }
            }
        });
        self.roles.set('approveOrderTypeRoles', approveOrderTypeRoles)
    }

    if (!self.roles.get('globalRoles')){
        let globalRoles = [];
        _.each(Template.parentData().roles[Roles.GLOBAL_GROUP], function(role) {
            globalRoles.push(role)
        });
        self.roles.set('globalRoles', globalRoles)
    }

    if (!self.roles.get('promotionRoles')){
        let promotionRoles = [];
        _.each(Template.parentData().roles[Roles.GLOBAL_GROUP], function(role) {
            if (role === Core.Permissions.PROMOTIONS_APPROVE ||
                role === Core.Permissions.PROMOTIONS_MANAGE ||
                role === Core.Permissions.PROMOTIONS_VIEW[0]) {
                promotionRoles.push(role)
            }
        });
        self.roles.set('promotionRoles', promotionRoles)
    }

    if (!self.roles.get('rebateRoles')){
        let rebateRoles = [];
        _.each(Template.parentData().roles[Roles.GLOBAL_GROUP], function(role) {
            if (role === Core.Permissions.REBATES_MANAGE || role === Core.Permissions.REBATES_VIEW[0]) {
                rebateRoles.push(role)
            }
        });
        self.roles.set('rebateRoles', rebateRoles)
    }

    if (!self.roles.get('manageReturnOrderRoles')){
        let returnOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageReturnOrders = _.some(value, function(r) {
                return r == Core.Permissions.RETURNORDERS_MANAGE;
            });
            if(canManageReturnOrders){
                if (key === Roles.GLOBAL_GROUP){
                    returnOrderRoles = ["ALL_ACCESS"]
                } else {
                    returnOrderRoles.push(key)
                }
            }
        });
        self.roles.set('manageReturnOrderRoles', returnOrderRoles)
    }

    if (!self.roles.get('viewReturnOrderRoles')){
        let viewReturnOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canViewReturnOrders = _.some(value, function(r) {
                return r == Core.Permissions.RETURNORDERS_VIEW[0];
            });
            if(canViewReturnOrders){
                if (key === Roles.GLOBAL_GROUP){
                    viewReturnOrderRoles = ["ALL_ACCESS"]
                } else {
                    viewReturnOrderRoles.push(key)
                }
            }
        });
        self.roles.set('viewReturnOrderRoles', viewReturnOrderRoles)
    }

    if (!self.roles.get('approveReturnOrderRoles')){
        let approveReturnOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canApproveReturnOrders = _.some(value, function(r) {
                return r == Core.Permissions.RETURNORDERS_APPROVE;
            });
            if(canApproveReturnOrders){
                if (key === Roles.GLOBAL_GROUP){
                    approveReturnOrderRoles = ["ALL_ACCESS"]
                } else {
                    approveReturnOrderRoles.push(key)
                }
            }
        });
        self.roles.set('approveReturnOrderRoles', approveReturnOrderRoles)
    }

    if (!self.roles.get('manageCustomers')){
        let manageCustomerRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageCustomers = _.some(value, function(r) {
                return r == Core.Permissions.CUSTOMERS_MAINTAIN;
            });
            if(canManageCustomers){
                if (key === Roles.GLOBAL_GROUP){
                    manageCustomerRoles = ["ALL_ACCESS"]
                } else {
                    manageCustomerRoles.push(key)
                }
            }
        });
        self.roles.set('manageCustomerRoles', manageCustomerRoles)
    }

    if (!self.roles.get('viewCustomers')){
        let viewCustomerRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canViewCustomers = _.some(value, function(r) {
                return r == Core.Permissions.CUSTOMERS_VIEW[0];
            });
            if(canViewCustomers){
                if (key === Roles.GLOBAL_GROUP){
                    viewCustomerRoles = ["ALL_ACCESS"]
                } else {
                    viewCustomerRoles.push(key)
                }
            }
        });
        self.roles.set('viewCustomerRoles', viewCustomerRoles)
    }

    if (!self.roles.get('manageInvoiceRoles')){
        let manageInvoiceRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageInvoices = _.some(value, function(r) {
                return r == Core.Permissions.INVOICES_MANAGE;
            });
            if(canManageInvoices){
                if (key === Roles.GLOBAL_GROUP){
                    manageInvoiceRoles = ["ALL_ACCESS"]
                } else {
                    manageInvoiceRoles.push(key)
                }
            }
        });
        self.roles.set('manageInvoiceRoles', manageInvoiceRoles)
    }

    if (!self.roles.get('viewInvoiceRoles')){
        let viewInvoiceRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canViewInvoices = _.some(value, function(r) {
                return r == Core.Permissions.INVOICES_VIEW[0];
            });
            if(canViewInvoices){
                if (key === Roles.GLOBAL_GROUP){
                    viewInvoiceRoles = ["ALL_ACCESS"]
                } else {
                    viewInvoiceRoles.push(key)
                }
            }
        });
        self.roles.set('viewInvoiceRoles', viewInvoiceRoles)
    }


    if (Template.parentData().notifications){
        self.notifications.set("notifications", Template.parentData().notifications)
    } else {
        let notifications = {};
        notifications.orderApprovals = true;
        notifications.orderCreated = true;
        notifications.orderUpdated = true;
        notifications.orderStatusChanged = true;
        notifications.orderCommentsCreated = true;
        notifications.orderShipped = true;
        notifications.returnOrderCreated = true;
        notifications.returnOrderApprovals = true;
        notifications.invoiceCreated = true;
        notifications.promotionsCreated = true;
        notifications.rebatesCreated = true;
        notifications.promotionApproved = true;
        notifications.paymentCreated = true;
        self.notifications.set("notifications", notifications)
    }

    instance.autorun(function () {
        self.subscribe('UserImages', Template.parentData()._id);
        self.subscribe('Locations');
        self.subscribe('OrderTypes');
        self.subscribe("CustomerGroups");
    });
});

Template.AccountDetail.onRendered(function () {
});

Template.AccountDetail.onDestroyed(function () {
});

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
