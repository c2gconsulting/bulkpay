/*****************************************************************************/
/* AccountEdit: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.AccountEdit.events({
    'keyup [name=email], keypress [name=email], change [name=email]': function(e, tmpl) {
        let user = Template.instance().user.get('user');
        let value = e.currentTarget.value;
        user.emails[0].address =  value;
        Template.instance().user.set('user', user);
    },

    'change .permissions [type=checkbox]': function (e, tmpl) {
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
                });
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
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('manageOrderRoles', selectedOptions);
    },

    'change [name=viewOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".viewOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('viewOrderRoles', selectedOptions);
    },

    'change [name=manageInvoices]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageInvoices select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('manageInvoiceRoles', selectedOptions);
    },

    'change [name=viewInvoices]': function(e, tmpl) {
        let selectedOptions = [];
        $(".viewInvoices select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('viewInvoiceRoles', selectedOptions);
    },

    'change [name=manageCustomers]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageCustomers select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });

        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('manageCustomerRoles', selectedOptions);
    },

    'change [name=viewCustomers]': function(e, tmpl) {
        let selectedOptions = [];
        $(".viewCustomers select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });

        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('viewCustomerRoles', selectedOptions);
    },

    'change [name=manageReturnOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".manageReturnOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('manageReturnOrderRoles', selectedOptions);
    },

    'change [name=viewReturnOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".viewReturnOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('viewReturnOrderRoles', selectedOptions);
    },


    'change [name=approveReturnOrders]': function(e, tmpl) {
        let selectedOptions = [];
        $(".approveReturnOrders select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
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
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('approveOrderRoles', selectedOptions);
    },

    'change [name=approveOrderTypes]': function(e, tmpl) {
        let selectedOptions = [];
        $(".approveOrderTypes select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('approveOrderTypeRoles', selectedOptions);
    },


    'change [name=global]': function(e, tmpl) {
        let selectedOptions = [];
        $(".global select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        Template.instance().roles.set('globalRoles', selectedOptions);
    },

    'change [name=promotions]': function(e, tmpl) {
        let selectedOptions = [];
        let nonSelected = [];
        $(".promotions select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        $('.promotions select option:not(:selected)').each(function () {
            let s = $(this).val();
            if(s){
                nonSelected.push(s);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        let globalRoles = Template.instance().roles.get('globalRoles');
        globalRoles = _.union(globalRoles, selectedOptions);
        globalRoles = _.difference(globalRoles, nonSelected);
        Template.instance().roles.set('promotionRoles', selectedOptions);
        Template.instance().roles.set('globalRoles', globalRoles);

    },

    'change [name=rebates]': function(e, tmpl) {
        let selectedOptions = [];
        let nonSelected = [];
        $(".rebates select :selected").each(function(){
            let v = $(this).val();
            if(v){
                selectedOptions.push(v);
            }
        });
        $('.rebates select option:not(:selected)').each(function () {
            let s = $(this).val();
            if(s){
                nonSelected.push(s);
            }
        });
        let allAccess = _.find(selectedOptions, function(o) {return o === "ALL_ACCESS"});
        if (allAccess){
            selectedOptions = ["ALL_ACCESS"]
        }
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
        let globalRoles = Template.instance().roles.get('globalRoles');
        globalRoles = _.union(globalRoles, selectedOptions);
        globalRoles = _.difference(globalRoles, nonSelected);
        Template.instance().roles.set('rebateRoles', selectedOptions);
        Template.instance().roles.set('globalRoles', globalRoles);
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


    'click .viewOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('viewOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('viewOrderRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },

    'click .manageInvoicesR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('manageInvoiceRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('manageInvoiceRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },


    'click .viewInvoicesR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('viewInvoiceRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('viewInvoiceRoles', selectedOptions);
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

    'click .promotionsR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('promotionRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('promotionRoles', selectedOptions);
        Meteor.defer(function() {
            tmpl.$('.selectpicker').selectpicker('refresh');
        });
    },


    'click .rebatesR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('rebateRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('rebateRoles', selectedOptions);
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

    'click .approveOrderTypesR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('approveOrderTypeRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('approveOrderTypeRoles', selectedOptions);
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

    'click .viewReturnOrdersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('viewReturnOrderRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('viewReturnOrderRoles', selectedOptions);
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

    'click .viewCustomersR .closebtn': function (e, tmpl) {
        let self = this.valueOf();
        let selectedOptions = Template.instance().roles.get('viewCustomerRoles');
        selectedOptions = _.reject(selectedOptions, function(x) {
            return x === self
        });
        Template.instance().roles.set('viewCustomerRoles', selectedOptions);
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
                Router.go('account.detail', { _id: user._id });
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
                Router.go('account.detail', { _id: self._id });

            });
    }
});

/*****************************************************************************/
/* AccountEdit: Helpers */
/*****************************************************************************/
Template.AccountEdit.helpers({
    assigneeCode: function () {
        if (this.salesProfile && this.salesProfile.originCode) return this.salesProfile.originCode;
    },
    email: function () {
        return this.emails[0].address
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

    viewReturns: function(){
        return Template.instance().roles.get('viewReturnOrderRoles');
    },

    approveReturns: function(){
        return Template.instance().roles.get('approveReturnOrderRoles');
    },


    approveOrders: function () {
        return Template.instance().roles.get('approveOrderRoles');
    },

    approveOrderTypes: function () {
        return Template.instance().roles.get('approveOrderTypeRoles');
    },

    label: function(string){
        if (string === "ALL_ACCESS"){
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
        let selected;
        if (permission === "manageOrders"){
            let roles = Template.instance().roles.get('manageOrderRoles');
            selected = _.some(roles, function(r) {
                return r == compareVal ;
            });
        }

        if (permission === "viewOrders"){
            let roles = Template.instance().roles.get('viewOrderRoles');
            selected = _.some(roles, function(r) {
                return r == compareVal ;
            });
        }

        if (permission === "manageInvoices"){
            let roles = Template.instance().roles.get('manageInvoiceRoles');
            selected = _.some(roles, function(r) {
                return r == compareVal ;
            });
        }

        if (permission === "viewInvoices"){
            let roles = Template.instance().roles.get('viewInvoiceRoles');
            selected = _.some(roles, function(r) {
                return r == compareVal ;
            });
        }

        if (permission === "approveOrders"){
            let roles = Template.instance().roles.get('approveOrderRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "approveOrderTypes"){
            let roles = Template.instance().roles.get('approveOrderTypeRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "manageReturnOrders"){
            let roles = Template.instance().roles.get('manageReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "viewReturnOrders"){
            let roles = Template.instance().roles.get('viewReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "approveReturnOrders"){
            let roles = Template.instance().roles.get('approveReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "manageCustomers"){
            let roles = Template.instance().roles.get('manageCustomerRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "viewCustomers"){
            let roles = Template.instance().roles.get('viewCustomerRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }

        if (permission === "globalRoles"){
            let roles = Template.instance().roles.get('globalRoles');
            selected = _.some(roles, function(r) {
                return r == String(compareVal) ;
            });
        }
        if(selected){
            return "selected"
        } 
        return '';
    },

    disabledIfAllAccess: function(permission) {
        let selected;
        if (permission === "manageOrders"){
            let roles = Template.instance().roles.get('manageOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "viewOrders"){
            let roles = Template.instance().roles.get('viewOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "manageInvoices"){
            let roles = Template.instance().roles.get('manageInvoiceRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "viewInvoices"){
            let roles = Template.instance().roles.get('viewInvoiceRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "approveOrders"){
            let roles = Template.instance().roles.get('approveOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "manageReturnOrders"){
            let roles = Template.instance().roles.get('manageReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "viewReturnOrders"){
            let roles = Template.instance().roles.get('viewReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "approveReturnOrders"){
            let roles = Template.instance().roles.get('approveReturnOrderRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "manageCustomers"){
            let roles = Template.instance().roles.get('manageCustomerRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "viewCustomers"){
            let roles = Template.instance().roles.get('viewCustomerRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "globalRoles"){
            let roles = Template.instance().roles.get('globalRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if (permission === "approveOrderTypes"){
            let roles = Template.instance().roles.get('approveOrderTypeRoles');
            selected = _.some(roles, function(r) {
                return r == "ALL_ACCESS" ;
            });
        }

        if(selected){
            return "disabled"
        }
        
        return '';
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

    enableSubmit: function () {
        let valid = Template.instance().user.get('enableSubmit');
        return valid ? "" : 'disabled'
    },
    avatar: function () {
        return UserImages.findOne({owner: this._id})
    },

    hasAdminAccess: function () {
        return Core.hasAdminAccess(Meteor.userId())
    },

    rebatesManage: function () {
        return Core.Permissions.REBATES_MANAGE
    },

    rebatesView: function () {
        return Core.Permissions.REBATES_VIEW[0]
    },

    promotionsManage: function () {
        return Core.Permissions.PROMOTIONS_MANAGE
    },

    promotionsView: function () {
        return Core.Permissions.PROMOTIONS_VIEW[0]
    },

    promotionsApprove: function () {
        return Core.Permissions.PROMOTIONS_APPROVE
    },

    adminAll: function () {
        return Core.Permissions.ADMIN_ALL[0]
    },

    viewAll: function () {
        return Core.Permissions.VIEW_ALL[0]
    }
});

/*****************************************************************************/
/* AccountEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountEdit.onCreated(function () {
    let self = this;
    self.roles = new ReactiveDict();
    self.user = new ReactiveDict();
    self.notifications = new ReactiveDict();
    self.user.set("user", Template.parentData())

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
                return r === Core.Permissions.RETURNORDERS_VIEW[0];
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
        let viewOrderRoles = self.roles.get('viewOrderRoles');
        let manageCustomerRoles =  self.roles.get('manageCustomerRoles');
        let viewCustomerRoles =  self.roles.get('viewCustomerRoles');
        let manageInvoiceRoles = self.roles.get('manageInvoiceRoles');
        let viewInvoiceRoles =  self.roles.get('viewInvoiceRoles');
        let manageReturnOrderRoles = self.roles.get('manageReturnOrderRoles');
        let viewReturnOrderRoles = self.roles.get('viewReturnOrderRoles');
        let approveReturnOrderRoles = self.roles.get('approveReturnOrderRoles');
        let approveOrderRoles = self.roles.get('approveOrderRoles');
        let globalRoles = self.roles.get('globalRoles');
        let promotionRoles = self.roles.get('promotionRoles');
        let rebateRoles = self.roles.get('rebateRoles');
        let approveOrderTypeRoles = self.roles.get('approveOrderTypeRoles');
        let roleObject = {
            "manageOrderRoles": manageOrderRoles,
            "viewOrderRoles": viewOrderRoles,
            "manageCustomerRoles": manageCustomerRoles,
            "viewCustomerRoles": viewCustomerRoles,
            "manageInvoiceRoles": manageInvoiceRoles,
            "viewInvoiceRoles": viewInvoiceRoles,
            "manageReturnOrderRoles": manageReturnOrderRoles,
            "viewReturnOrderRoles": viewReturnOrderRoles,
            "approveReturnOrderRoles": approveReturnOrderRoles,
            "approveOrderRoles": approveOrderRoles,
            "globalRoles": globalRoles,
            "promotionRoles": promotionRoles,
            "rebateRoles": rebateRoles,
            "approveOrderTypeRoles": approveOrderTypeRoles
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

Template.AccountEdit.onRendered(function () {
});

Template.AccountEdit.onDestroyed(function () {
});

function prepareRoles(roleObject) {
    let allRoles = _.union(roleObject.manageOrderRoles, roleObject.manageCustomerRoles,
        roleObject.manageReturnOrderRoles, roleObject.viewReturnOrderRoles,  roleObject.approveReturnOrderRoles,
        roleObject.approveOrderRoles, roleObject.viewOrderRoles, roleObject.viewCustomerRoles,
        roleObject.manageInvoiceRoles, roleObject.viewInvoiceRoles, roleObject.promotionRoles, roleObject.rebateRoles, roleObject.approveOrderTypeRoles);

    let roles = {};
    roles[Roles.GLOBAL_GROUP] = [];
    let permissionsToRemove = [];

    _.each(allRoles, function(role){
        roles[role] = []
    });


    if(_.isArray(roleObject.manageOrderRoles) && roleObject.manageOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.ORDERS_MANAGE);
    }

    if(_.isArray(roleObject.manageCustomerRoles) && roleObject.manageCustomerRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.CUSTOMERS_MAINTAIN);
    }

    if(_.isArray(roleObject.manageReturnOrderRoles) && roleObject.manageReturnOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.RETURNORDERS_MANAGE);
    }

    if(_.isArray(roleObject.viewReturnOrderRoles) && roleObject.viewReturnOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.RETURNORDERS_VIEW[0]);
    }

    if(_.isArray(roleObject.approveReturnOrderRoles) && roleObject.approveReturnOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.RETURNORDERS_APPROVE);
    }

    if(_.isArray(roleObject.approveOrderRoles) && roleObject.approveOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.ORDERS_APPROVE);
    }

    if(_.isArray(roleObject.approveOrderTypeRoles) && roleObject.approveOrderTypeRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.ORDERTYPES_APPROVE);
    }

    if(_.isArray(roleObject.viewOrderRoles) && roleObject.viewOrderRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.ORDERS_VIEW[0]);
    }

    if(_.isArray(roleObject.viewCustomerRoles) && roleObject.viewCustomerRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.CUSTOMERS_VIEW[0]);
    }

    if(_.isArray(roleObject.manageInvoiceRoles) && roleObject.manageInvoiceRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.INVOICES_MANAGE);
    }

    if(_.isArray(roleObject.viewInvoiceRoles) && roleObject.viewInvoiceRoles.length === 0 ){
        permissionsToRemove.push(Core.Permissions.INVOICES_VIEW[0]);
    }



    _.each(roleObject.manageOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ORDERS_MANAGE)
        } else {
            permissionsToRemove.push(Core.Permissions.ORDERS_MANAGE);
            roles[role].push(Core.Permissions.ORDERS_MANAGE)
        }
    });

    _.each(roleObject.viewOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ORDERS_VIEW[0])
        } else {
            permissionsToRemove.push(Core.Permissions.ORDERS_VIEW[0]);
            roles[role].push(Core.Permissions.ORDERS_VIEW[0])
        }
    });

    _.each(roleObject.manageInvoiceRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.INVOICES_MANAGE)
        } else {
            permissionsToRemove.push(Core.Permissions.INVOICES_MANAGE);
            roles[role].push(Core.Permissions.INVOICES_MANAGE)
        }
    });

    _.each(roleObject.viewInvoiceRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.INVOICES_VIEW[0])
        } else {
            permissionsToRemove.push(Core.Permissions.INVOICES_VIEW[0]);
            roles[role].push(Core.Permissions.INVOICES_VIEW[0])
        }
    });

    _.each(roleObject.manageCustomerRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.CUSTOMERS_MAINTAIN)
        } else {
            permissionsToRemove.push(Core.Permissions.CUSTOMERS_MAINTAIN);
            roles[role].push(Core.Permissions.CUSTOMERS_MAINTAIN)
        }
    });

    _.each(roleObject.viewCustomerRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.CUSTOMERS_VIEW[0])
        } else {
            permissionsToRemove.push(Core.Permissions.CUSTOMERS_VIEW[0]);
            roles[role].push(Core.Permissions.CUSTOMERS_VIEW[0])
        }
    });

    _.each(roleObject.manageReturnOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.RETURNORDERS_MANAGE)
        } else {
            permissionsToRemove.push(Core.Permissions.RETURNORDERS_MANAGE);
            roles[role].push(Core.Permissions.RETURNORDERS_MANAGE)
        }
    });

    _.each(roleObject.viewReturnOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.RETURNORDERS_VIEW[0])
        } else {
            permissionsToRemove.push(Core.Permissions.RETURNORDERS_VIEW[0]);
            roles[role].push(Core.Permissions.RETURNORDERS_VIEW[0])
        }
    });

    _.each(roleObject.approveOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ORDERS_APPROVE)
        } else {
            permissionsToRemove.push(Core.Permissions.ORDERS_APPROVE);
            roles[role].push(Core.Permissions.ORDERS_APPROVE)
        }
    });

    _.each(roleObject.approveOrderTypeRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ORDERTYPES_APPROVE)
        } else {
            permissionsToRemove.push(Core.Permissions.ORDERTYPES_APPROVE);
            roles[role].push(Core.Permissions.ORDERTYPES_APPROVE)
        }
    });

    _.each(roleObject.approveReturnOrderRoles, function (role) {
        if (role === "ALL_ACCESS"){
            roles[Roles.GLOBAL_GROUP].push(Core.Permissions.RETURNORDERS_APPROVE)
        } else {
            permissionsToRemove.push(Core.Permissions.RETURNORDERS_APPROVE);
            roles[role].push(Core.Permissions.RETURNORDERS_APPROVE)
        }
    });

    if (roleObject.globalRoles && roleObject.globalRoles.length > 0){
        _.each(roleObject.globalRoles, function (role) {
            if (role === "ALL_ACCESS"){
                roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ADMIN_ALL[0])
            } else if(role === "VIEW_ALL"){
                roles[Roles.GLOBAL_GROUP].push(Core.Permissions.VIEW_ALL[0])
            } else {
                roles[Roles.GLOBAL_GROUP].push(role)
            }
        });

    }

    if (roleObject.promotionRoles && roleObject.promotionRoles.length > 0){
        _.each(roleObject.promotionRoles, function (role) {
            if (role === "ALL_ACCESS"){
                roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ADMIN_ALL[0])
            } else {
                roles[Roles.GLOBAL_GROUP].push(role)
            }
        });
    }

    if (roleObject.rebateRoles && roleObject.rebateRoles.length > 0){
        _.each(roleObject.rebateRoles, function (role) {
            if (role === "ALL_ACCESS"){
                roles[Roles.GLOBAL_GROUP].push(Core.Permissions.ADMIN_ALL[0])
            } else {
                roles[Roles.GLOBAL_GROUP].push(role)
            }
        });
    }

    delete roles["ALL_ACCESS"];
    delete roles[Core.Permissions.PROMOTIONS_MANAGE];
    delete roles[Core.Permissions.PROMOTIONS_APPROVE];
    delete roles[Core.Permissions.PROMOTIONS_VIEW[0]];
    delete roles[Core.Permissions.REBATES_VIEW[0]];
    delete roles[Core.Permissions.REBATES_MANAGE];
    roles[Roles.GLOBAL_GROUP] = _.union(roles[Roles.GLOBAL_GROUP]);
    if (roles[Roles.GLOBAL_GROUP] && roles[Roles.GLOBAL_GROUP].length <= 0){
        delete roles[Roles.GLOBAL_GROUP]
    }
    _.each(permissionsToRemove, function (p) {
        let roleP = _.find(roles[Roles.GLOBAL_GROUP], function (r) {
          return r === p
        });

        if (roleP){
            roles[Roles.GLOBAL_GROUP] =    _.reject(roles[Roles.GLOBAL_GROUP], function(x) {
                return x === roleP
            });
        }
    });

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
