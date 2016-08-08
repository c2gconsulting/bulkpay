import Ladda from 'ladda';
/*****************************************************************************/
/* ProfileEdit: Event Handlers */
/*****************************************************************************/
Template.ProfileEdit.events({
    'keyup [name=email], keypress [name=email], change [name=email]': function(e, tmpl) {
       let user = Template.instance().user.get('user');
       let value = e.currentTarget.value;
       user.emails[0].address =  value;
       Template.instance().user.set('user', user);
    },

    'change [type=checkbox]': function (e, tmpl) {
        if(e.currentTarget.checked) {
            $(e.currentTarget).closest('.row').find('select').prop("disabled", false);
        } else {
            $(e.currentTarget).closest('.row').find('select').prop("disabled", true);
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'change #manualInput': FS.EventHandlers.insertFiles(UserImages, {
        metadata: function (fileObj) {
            return {
                owner: Template.instance().user.get('user')._id,
                tenantId: Core.getTenantId()
            };
        },
        after: function (error, fileObj) {
            if (error){
                if (error.reason){
                    toastr.error(error.reason, 'Error')
                } else {
                    toastr.warning("Invalid file format selected or file too large", "Warning")
                }
            } else {
                let images = UserImages.find({owner: fileObj.owner, _id: {$ne: fileObj._id}}).fetch()
                _.each(images, function (i) {
                    i.remove()
                })
                toastr.success('File successfully uploaded', 'Success')
            }
        }
    }),

    'keyup [name=assigneeCode], keypress [name=assigneeCode], change [name=assigneeCode]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        if (user.salesProfile){
             user.salesProfile.originCode = value
        } else {
            user.salesProfile = {originCode: value}
        }
        Template.instance().user.set('user', user);
    },

    'keyup [name=username], keypress [name=username], change [name=username]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        user.username = value;
        Template.instance().user.set('user', user);
    },

    'keyup [name=workPhone], keypress [name=workPhone], change [name=workPhone]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        if (user.profile){
            user.profile.workPhone = value
        } else {
            user.profile = {workPhone: value}
        }
        Template.instance().user.set('user', user);
    },

    'keyup [name=fullName], keypress [name=fullName], change [name=fullName]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        if (user.profile){
            user.profile.fullName = value
        } else {
            user.profile = {fullName: value}
        }
        Template.instance().user.set('user', user);
    },

    'keyup [name=homePhone], keypress [name=homePhone], change [name=homePhone]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        if (user.profile){
            user.profile.homePhone = value
        } else {
            user.profile = {homePhone: value}
        }
        Template.instance().user.set('user', user);
    },


    'change [name=manageOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('manageOrderRoles', selectedOptions);
    },

    'change [name=manageCustomers]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageCustomers select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('manageCustomerRoles', selectedOptions);
    },

    'change [name=manageReturnOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageReturnOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('manageReturnOrderRoles', selectedOptions);
    },

    'change [name=approveReturnOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".approveReturnOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('approveReturnOrderRoles', selectedOptions);
    },

    'change [name=approveOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".approveOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('approveOrderRoles', selectedOptions);
    },

    'change [name=global]': function(e, tmpl) {
        let selectedOptions = [];
        $(".global select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        Template.instance().roles.set('globalRoles', selectedOptions);
    },

    'click .manageOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('manageOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('manageOrderRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .globalR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('globalRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('globalRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .approveOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('approveOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('approveOrderRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .manageReturnOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('manageReturnOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('manageReturnOrderRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .approveReturnOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('approveReturnOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('approveReturnOrderRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .manageCustomersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('manageCustomerRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('manageCustomerRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click #save': function(e, tmpl){
        let user = Template.instance().user.get('user');
        e.preventDefault();

          tmpl.$('#save').attr('disabled', true);
        try {
            let l = Ladda.create(tmpl.$('#save')[0]);
            l.start();
        } catch(e) {
            console.log(e);
        }

            Meteor.call('account/update', user, user._id, function(error, result) {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#save')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }
                if (error) {
                    swal({
                        title: "Oops!",
                        text: error.reason,
                        confirmButtonClass: "btn-error",
                        type: "error",
                        confirmButtonText: "OK"
                    });
                } else {
                    swal({
                        title: "Success",
                        text: `Account has been updated`,
                        confirmButtonClass: "btn-success",
                        type: "success",
                        confirmButtonText: "OK"
                    });
                    Router.go('profile.detail', { _id: user._id });
                }
            });
    },

    'change .onoffswitch-checkbox': function(e, tmpl) {
        let notificationsType  = e.currentTarget.dataset.field;
        let notifications = Template.instance().notifications.get('notifications');
        let value = e.currentTarget.value;
        if (e.currentTarget.type === 'checkbox') value = e.currentTarget.checked;
        if (notifications && notifications.hasOwnProperty(notificationsType)){
            notifications[notificationsType] = value;
            Template.instance().notifications.set('notifications', notifications);
        } else {
            console.log(notificationsType, "not found")
        }
    },

    'click #cancel-edit': function(e, tmpl) {
        let self = this;
        swal({
                title: "Are you sure?",
                text: "You will lose any changes you made!",
                type: "warning",
                showCancelButton: true,
                cancelButtonText: "Cancel",
                confirmButtonClass: "btn-danger",
                confirmButtonText: "Yes, exit!",
                closeOnConfirm: true
            },
            function() {
                Router.go('profile.detail', { _id: self._id });

            });
    }
});

/*****************************************************************************/
/* ProfileEdit: Helpers */
/*****************************************************************************/
Template.ProfileEdit.helpers({
    assigneeCode: function () {
        if (this.salesProfile && this.salesProfile.originCode) return this.salesProfile.originCode;
    },
    email: function () {
        return this.emails[0].address
    },

    manageOrders: function(){
       return Template.instance().roles.get('manageOrderRoles');
    },

    manageCustomers: function(){
        return Template.instance().roles.get('manageCustomerRoles');
    },

    manageReturns: function(){
        return Template.instance().roles.get('manageReturnOrderRoles');
    },

    approveReturns: function(){
        return Template.instance().roles.get('approveReturnOrderRoles');
    },


    approveOrders: function () {
        return Template.instance().roles.get('approveOrderRoles'); 
    },

    label: function(string){
        let location = Locations.findOne(string);
        if (location) return location.name ? location.name : " ";
        let orderType = OrderTypes.findOne({code: Number(string)});
        if (orderType) return  orderType.name ? orderType.name : " "
    },
    
    customerGroup: function(){
        let customerGroup =  CustomerGroups.findOne({code: this.valueOf()});
        return customerGroup ? customerGroup.name : " "
    },

    customerGroups: function(){
       return CustomerGroups.find()  
    },
    
    orderTypes: function () {
        return OrderTypes.find().fetch()
    },

    user: function () {
        return Template.instance().user.get('user');
    },

    errorsFor: function (field) {
        let errors =  Template.instance().user.get('formErrors') || [];
        let error = _.find(errors, function(e) {return e.field === field});
        if (error){
            return error.message
        }
    },


    selected: function(permission, compareVal) {
        if (permission === "manageOrders"){
            let roles = Template.instance().roles.get('manageOrderRoles');
            let selected = _.some(roles, function(r) {
                return r == compareVal ;
            });
            if(selected){
                return "selected"
            }
        }

        if (permission === "approveOrders"){
            let roles = Template.instance().roles.get('approveOrderRoles');
            let selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
            if(selected){
                return "selected"
            }
        }

        if (permission === "manageReturnOrders"){
            let roles = Template.instance().roles.get('manageReturnOrderRoles');
            let selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
            if(selected){
                return "selected"
            }
        }

        if (permission === "approveReturnOrders"){
            let roles = Template.instance().roles.get('approveReturnOrderRoles');
            let selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
            if(selected){
                return "selected"
            }
        }

        if (permission === "manageCustomers"){
            let roles = Template.instance().roles.get('manageCustomerRoles');
            let selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
            if(selected){
                return "selected"
            }
        }

        if (permission === "__global_roles__"){
            let roles = Template.instance().roles.get('globalRoles');
            let selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
            if(selected){
                return "selected"
            }
        }
        return '';
    },

    globalPermissions: function () {
        return Template.instance().roles.get('globalRoles');
    },
    
    globalPermissionLabel: function (permission) {
        if (permission === "admin/all") return "Full Admin Access";
        if (permission === "promotions/manage") return "Manage Promotions";
        if (permission === "promotions/approve") return "Approve Promotions";
        if (permission === "customers/maintain") return "Manage customers";
        if (permission === "rebates/manage") return "Manage Rebates"
    },
    
    enableSubmit: function () {
        let valid = Template.instance().user.get('enableSubmit');
        return valid ? "" : 'disabled'
    },
    avatar: function () {
        return UserImages.findOne({owner: this._id})
    },
    
    hasAdminAccess: function () {
         return Core.hasAdminAccess(Meteor.userId())
    }
});

/*****************************************************************************/
/* ProfileEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.ProfileEdit.onCreated(function () {
    let self = this;
    self.roles = new ReactiveDict();
    self.user = new ReactiveDict();
    self.notifications = new ReactiveDict();
    self.user.set("user", Template.parentData())

    if (!self.roles.get('manageOrderRoles')){
        let manageOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageOrders = _.some(value, function(r) {
                return r == 'orders/manage';
            });
            if(canManageOrders){
                manageOrderRoles.push(key)
            }
        });
        self.roles.set('manageOrderRoles', manageOrderRoles)
    }

    if (!self.roles.get('approveOrderRoles')){
        let approveOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canApproveOrders = _.some(value, function(r) {
                return r == 'orders/approve';
            });
            if(canApproveOrders){
                approveOrderRoles.push(key)
            }
        });
        self.roles.set('approveOrderRoles', approveOrderRoles)
    }

    if (!self.roles.get('globalRoles')){
        let globalRoles = [];
        _.each(Template.parentData().roles["__global_roles__"], function(role) {
                globalRoles.push(role)
        });
        self.roles.set('globalRoles', globalRoles)
    }

    if (!self.roles.get('manageReturnOrderRoles')){
        let returnOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageReturnOrders = _.some(value, function(r) {
                return r == 'returnorders/manage';
            });
            if(canManageReturnOrders){
                returnOrderRoles.push(key)
            }
        });
        self.roles.set('manageReturnOrderRoles', returnOrderRoles)
    }

    if (!self.roles.get('approveReturnOrderRoles')){
        let approveReturnOrderRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canApproveReturnOrders = _.some(value, function(r) {
                return r == 'returnorders/approve';
            });
            if(canApproveReturnOrders){
                approveReturnOrderRoles.push(key)
            }
        });
        self.roles.set('approveReturnOrderRoles', approveReturnOrderRoles)
    }

    if (!self.roles.get('manageCustomers')){
        let manageCustomerRoles = [];
        _.each(Template.parentData().roles, function(value, key) {
            let canManageCustomers = _.some(value, function(r) {
                return r == 'customers/maintain';
            });
            if(canManageCustomers){
                manageCustomerRoles.push(key)
            }
        });
        self.roles.set('manageCustomerRoles', manageCustomerRoles)
    }

    if (!self.notifications.get('notifications')){
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
    }
    
    self.autorun(function() {
        self.subscribe("CustomerGroups");
        self.subscribe('Locations');
        self.subscribe('OrderTypes');
        self.subscribe('UserImages', Template.parentData()._id);
        if (self.subscriptionsReady()) {
            try {
                Meteor.defer(function() {
                    self.$('.selectpicker').selectpicker('refresh');
                });
            } catch (e) {

            }

        }

        let manageOrderRoles = self.roles.get('manageOrderRoles');
        let manageCustomerRoles =  self.roles.get('manageCustomerRoles');
        let manageReturnOrderRoles = self.roles.get('manageReturnOrderRoles');
        let approveReturnOrderRoles = self.roles.get('approveReturnOrderRoles');
        let approveOrderRoles = self.roles.get('approveOrderRoles');
        let globalRoles = self.roles.get('globalRoles');
        let roleObject = {
            "manageOrderRoles": manageOrderRoles,
            "manageCustomerRoles": manageCustomerRoles,
            "manageReturnOrderRoles": manageReturnOrderRoles,
            "approveReturnOrderRoles": approveReturnOrderRoles,
            "approveOrderRoles": approveOrderRoles,
            "globalRoles": globalRoles
        };
        let user =  self.user.get("user");
        user.notifications =  self.notifications.get("notifications");
        user.roles = prepareRoles(roleObject);
        self.user.set("user", user);

        let status = validateForm(user.profile.fullName, user.emails[0].address, user.username);
        if (_.isArray(status) && status.length > 0){
            self.user.set("enableSubmit", false);
            self.user.set("formErrors", status)
        } else {
            self.user.set("enableSubmit", true);
            self.user.set("formErrors", status)
        }
    });
    

});

Template.ProfileEdit.onRendered(function () {

});

Template.ProfileEdit.onDestroyed(function () {
});


function prepareRoles(roleObject) {
    let allRoles = _.union(roleObject.manageOrderRoles, roleObject.manageCustomerRoles,
        roleObject.manageReturnOrderRoles, roleObject.approveReturnOrderRoles, roleObject.approveOrderRoles);

    let roles = {};

    _.each(allRoles, function(role){
        roles[role] = []
    });

    _.each(roleObject.manageOrderRoles, function (role) {
        roles[role].push("orders/manage")
    });

    _.each(roleObject.manageCustomerRoles, function (role) {
        roles[role].push("customers/maintain")
    });

    _.each(roleObject.manageReturnOrderRoles, function (role) {
        roles[role].push("returnorders/manage")
    });

    _.each(roleObject.approveOrderRoles, function (role) {
        roles[role].push("orders/approve")
    });

    _.each(roleObject.approveReturnOrderRoles, function (role) {
        roles[role].push("returnorders/approve")
    });

    if (roleObject.globalRoles && roleObject.globalRoles.length > 0){

        roles["__global_roles__"] = [];

        _.each(roleObject.globalRoles, function (role) {
            roles["__global_roles__"].push(role)
        });

    }

   return roles
}

function validateForm(fullName, email) {
    let status = [];
    let usernameRegex = /^[a-zA-Z0-9]+$/;

    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    if (fullName == null || fullName == "") {
        status.push({hasError: true, message: "Full Name cannot be blank.\n", field: "fullName"});
    }

    if (email == null || email == "") {
        status.push({hasError: true, message: "Email cannot be blank.", field: "email"});
    } else if (!re.test(email)){
        status.push({hasError: true, message: "Email is invalid.\n", field: "email"});
    }

    return status
}