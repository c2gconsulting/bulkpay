/*****************************************************************************/
/* TenantSettings: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';
Template.TenantSettings.events({
    'click #save-tenant': function(e, tmpl) {
        e.preventDefault();
            let tenant = Template.instance().tenant.get('tenant');
            // Load button animation
            tmpl.$('#save-tenant').text('Saving... ');
            tmpl.$('#save-tenant').attr('disabled', true);

            try {
                let l = Ladda.create(tmpl.$('#save-tenant')[0]);
                l.start();
            } catch(e) {
                console.log(e);
            }

            let resetButton = function () {
                // End button animation
                try {
                    let l = Ladda.create(tmpl.$('#save-tenant')[0]);
                    l.stop();
                    l.remove();
                } catch(e) {
                    console.log(e);
                }

                tmpl.$('#save-tenant').text('Save');
                tmpl.$('#save-tenant').removeAttr('disabled');
            };

            Meteor.call('tenant/update', tenant._id, tenant, function (error, result) {
                if (error) {
                    toastr.error(error.reason, 'Error');
                    resetButton();
                } else {
                    toastr.success('File successfully uploaded', 'Success');
                    resetButton();
                }
            });
    },
    "click #newRounding": function (e, tmpl) {
        let tenant = Template.instance().tenant.get('tenant');
        let object = tenant.settings.rounding || {};
        let a = [];
        let keys = Object.keys(object);
        _.each(keys, function (key) {
            if (object.hasOwnProperty(key)) {
                a.push(key);
            }
        });
        let allCurrencies = currencies();
        if (a.length > 0){
            let options = _.difference(allCurrencies, a);
            object[options[0]] = 0
        }
        Template.instance().tenant.set('tenant', tenant);
    },
    'keyup input[name=name], change input[name=name]': function(e, tmpl) {
        // get amount
        let tenant = Template.instance().tenant.get('tenant');
        let value = tmpl.$('input[name=name]').val();
        tenant.name = value
        Template.instance().tenant.set('tenant', tenant);
    },
    'keyup input[name=description], change input[name=description]': function(e, tmpl) {
        // get amount
        let tenant = Template.instance().tenant.get('tenant');
        let value = tmpl.$('input[name=description]').val();
        tenant.description = value
        Template.instance().tenant.set('tenant', tenant);
    },
    'change [name=country]': function(e, tmpl) {
        let tenant = Template.instance().tenant.get('tenant');
        let value = tmpl.$('[name=country]').val().trim();
        tenant.country = value;
        Template.instance().tenant.set('tenant', tenant);
    },

    'change [name=timezone]': function(e, tmpl) {
        let tenant = Template.instance().tenant.get('tenant');
        let value = tmpl.$('[name=timezone]').val().trim();
        tenant.timezone = value;
        Template.instance().tenant.set('tenant', tenant);
    },

    'change [name=currencies]': function () {
        let tenant = Template.instance().tenant.get('tenant');
        let options = [];
        let selected = $("[name=currencies]").find("option:selected");
        _.each(selected, function(select){
            options.push(select.value)
        });
        tenant.currencies = _.uniq(options);
        Template.instance().tenant.set('tenant', tenant);
    },
    'change [name=currency]': function (e) {
        let oldKey = this.valueOf();
        let value = e.currentTarget.value;
        let tenant = Template.instance().tenant.get('tenant');
        let object = tenant.settings.rounding || {};
        if (oldKey !== value) {
            Object.defineProperty(object, value,
                Object.getOwnPropertyDescriptor(object, oldKey));
            delete object[oldKey];
        }
        Template.instance().tenant.set('tenant', tenant);
    },

    'keyup input[name=roundBy], change [name=roundBy]': function (e) {
        let oldKey = this.valueOf();
        let value = e.currentTarget.value || 0;
        let tenant = Template.instance().tenant.get('tenant');
        let object = tenant.settings.rounding || {};
        object[oldKey] = value
        Template.instance().tenant.set('tenant', tenant);
    },
    'change [name=orderTypes]': function () {
        let tenant = Template.instance().tenant.get('tenant');
        let object = tenant.settings.promotions || {};
        let options = [];
        let selected = $("[name=orderTypes]").find("option:selected");
        _.each(selected, function(select){
            options.push(Number(select.value))
        });
        object["excludedOrderTypes"] = _.uniq(options);
        console.log(tenant.settings)
        Template.instance().tenant.set('tenant', tenant);
    },

    'click [name=btnAddItem]': function (event, tmpl) {
        let tenant = Template.instance().tenant.get('tenant');
        tenant.addressBook.push({
            _id: Random.id(),
            country: Core.getTenantCountry(),
            isCommercial: true,
            isShippingDefault: tenant.addressBook.length === 0,
            isBillingDefault: tenant.addressBook.length === 0,
        });
        Template.instance().tenant.set('tenant', tenant);
    },
    'click .remove-item': function(event, tmpl) {
        let id = event.currentTarget.dataset.id;
        let tenant = Template.instance().tenant.get('tenant');
        tenant.addressBook = _.reject(tenant.addressBook, function (address) {
            return address._id === id;
        });
        Template.instance().tenant.set('tenant', tenant);
    },
    'change [name=shipping]': function (event, tmpl) {
        let id = event.currentTarget.dataset.id;
        let tenant = Template.instance().tenant.get('tenant');
        _.each(tenant.addressBook, function (address) {
            address.isShippingDefault = address._id === id;
        });
        Template.instance().tenant.set('tenant', tenant);
    },
    'change [name=billing]': function (event, tmpl) {
        let id = event.currentTarget.dataset.id;
        let tenant = Template.instance().tenant.get('tenant');
        _.each(tenant.addressBook, function (address) {
            address.isBillingDefault = address._id === id;
        });
        Template.instance().tenant.set('tenant', tenant);
    },
    'blur input.customer-address-items': function (event, tmpl) {
        let id = event.currentTarget.dataset.id;
        let column = event.currentTarget.dataset.column;
        let value = event.currentTarget.value.trim();
        let tenant = Template.instance().tenant.get('tenant');
        var addressBook = _.find(tenant.addressBook, function (singleAddress) {
            return singleAddress._id === id;
        });
        if (addressBook && value.length > 0) {
            addressBook[column] = value;
        } else {
            delete addressBook[column];
        }
        Template.instance().tenant.set('tenant', tenant);
    },
    'click .remove-sign1':function (e) {
        let value = this.valueOf();
        let tenant = Template.instance().tenant.get('tenant');
        let object = tenant.settings.rounding || {};
        delete object[value]
        Template.instance().tenant.set('tenant', tenant);
    },
    //'change #manualInput': FS.EventHandlers.insertFiles(TenantImages, {
    //    metadata: function (fileObj) {
    //        return {
    //            owner: Template.instance().tenant.get('tenant')._id,
    //            tenantId: Core.getTenantId()
    //        };
    //    },
    //    after: function (error, fileObj) {
    //        if (error){
    //            if (error.reason){
    //                toastr.error(error.reason, 'Error')
    //            } else {
    //                toastr.warning("Invalid file format selected or file too large", "Warning")
    //            }
    //        } else {
    //            let images = TenantImages.find({owner: fileObj.owner, _id: {$ne: fileObj._id}}).fetch()
    //            _.each(images, function (i) {
    //                i.remove()
    //            });
    //            toastr.success('Logo successfully uploaded', 'Success')
    //        }
    //    }
    //}),
    //
    //'change #manualMiniInput': FS.EventHandlers.insertFiles(TenantMiniImages, {
    //    metadata: function (fileObj) {
    //        return {
    //            owner: Template.instance().tenant.get('tenant')._id,
    //            tenantId: Core.getTenantId()
    //        };
    //    },
    //    after: function (error, fileObj) {
    //        if (error){
    //            if (error.reason){
    //                toastr.error(error.reason, 'Error')
    //            } else {
    //                toastr.warning("Invalid file format selected or file too large", "Warning")
    //            }
    //        } else {
    //            let images = TenantMiniImages.find({owner: fileObj.owner, _id: {$ne: fileObj._id}}).fetch()
    //            _.each(images, function (i) {
    //                i.remove()
    //            });
    //            toastr.success('Mini Logo successfully uploaded', 'Success')
    //        }
    //    }
    //}),
    'click #cancel-edit': function (e, tmpl) {
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
            function () {
                Router.go('home');

            });
    }

});

/*****************************************************************************/
/* TenantSettings: Helpers */
/*****************************************************************************/
Template.TenantSettings.helpers({
    errorsFor: function (field) {
        let errors =  Template.instance().tenant.get('formErrors') || [];
        let error = _.find(errors, function(e) {return e.field === field});
        if (error){
            return error.message
        }
    },
    
    timeZones: function () {
        return moment.tz.names();
    },
    
    countries: function () {
        return Core.IsoCountries();
    },

    currencies: function () {
        return Core.currencies();
    },
    selected: function () {
        let self = this.valueOf();
        let selected;
        let tenant = Template.instance().tenant.get('tenant')
        let currencies = tenant.currencies
        selected = _.some(currencies, function(r) {
            return r ===  self;
        });
        if (selected){
            return "selected"
        }
    },
    
    roundings: function () {
        let tenant = Template.instance().tenant.get('tenant')
        let object = tenant.settings.rounding || {}
        let a = []
        let keys = Object.keys(object);
        _.each(keys, function (key) {
            if (object.hasOwnProperty(key)) {
                a.push(key);
            }
        })
        return a
    },
    roundingValue: function () {
        let tenant = Template.instance().tenant.get('tenant')
        let object = tenant.settings.rounding || {};
        return object[this.valueOf()]
    },
    getCheckedStatus: function (checkedStatus) {
        return checkedStatus ? 'checked' : '';
    },
    selectedOrder: function () {
        let self = this
        let selected;
        let tenant = Template.instance().tenant.get('tenant')
        let orderTypes = tenant.settings && tenant.settings.promotions && tenant.settings.promotions.excludedOrderTypes ?
            tenant.settings.promotions.excludedOrderTypes : {}
        selected = _.some(orderTypes, function(r) {
            return r ===  self.code;
        });
        if (selected){
            return "selected"
        }
    },
    tenant: function () {
        return Template.instance().tenant.get('tenant');
    },
    disableSubmit: function() {
        let tenantContext = Core.Schemas.Tenant.namedContext("tenantForm");
        if (tenantContext.isValid()) return '';
        else return 'disabled';
    }
    //logo: function () {
    //    let tenant = Template.instance().tenant.get('tenant');
    //    return TenantImages.findOne({owner: tenant._id})
    //},
    //logoMini: function () {
    //    let tenant = Template.instance().tenant.get('tenant');
    //    return TenantMiniImages.findOne({owner: tenant._id})
    //}


});

/*****************************************************************************/
/* TenantSettings: Lifecycle Hooks */
/*****************************************************************************/
Template.TenantSettings.onCreated(function () {
    let self = this;
    let instance = this;
    self.tenant = new ReactiveDict();
    let tenant = Tenants.findOne(Core.getTenantId());
    if (!tenant.settings){
        tenant.settings = {}
    }

    if(!tenant.settings.promotions){
        tenant.settings.promotions = {}
    }

    if (!tenant.settings.rounding){
        tenant.settings.rounding = {}
    }
    self.tenant.set("tenant", tenant);


    let tenantContext = Core.Schemas.Tenant.namedContext("tenantForm");

    instance.autorun(function () {
        let foundTenant = Template.instance().tenant.get('tenant')
        instance.subscribe('TenantImages', foundTenant._id);
        instance.subscribe('TenantMiniImages', foundTenant._id);

        tenantContext.validate(foundTenant);
        if (tenantContext.isValid()) {
            console.log('Tenant is Valid!');
        } else {
            console.log('Tenant is not Valid!');
        }
        console.log(tenantContext._invalidKeys);
    });

});

Template.TenantSettings.onRendered(function () {
});

Template.TenantSettings.onDestroyed(function () {
});
