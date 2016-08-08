import Ladda from 'ladda';

/*****************************************************************************/
/* DistributorsCreate: Event Handlers */
/*****************************************************************************/
Template.DistributorsCreate.events({

  'click #create-customer': function(e, tmpl) {
    e.preventDefault();
    let customerContext = Core.Schemas.Customer.namedContext("customerForm");
    if (customerContext.isValid()) {

      let customer = tmpl.cleanCustomer(tmpl.getCustomer());
      // Load button animation
      tmpl.$('#create-customer').text('Saving... ');
      tmpl.$('#create-customer').attr('disabled', true);

      try {
        let l = Ladda.create(tmpl.$('#create-customer')[0]);
        l.start();
      } catch(e) {
        console.log(e);
      }

      let resetButton = function () {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#create-customer')[0]);
          l.stop();
          l.remove();
        } catch(e) {
          console.log(e);
        }

        tmpl.$('#create-customer').text('Save');
        tmpl.$('#create-customer').removeAttr('disabled');
      };

      Meteor.call('customers/createCustomer', customer, function (error, result) {
        if (error) {
          console.log(error);
          swal({
            title: "Oops!",
            text: error.reason,
            confirmButtonClass: "btn-error",
            type: "error",
            confirmButtonText: "OK"
          });
          resetButton();
        } else {
          swal({
            title: "Success",
            text: `Customer ${result.customerNumber} has been created`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });

          // wipe slate clean
          tmpl.resetDraftCustomer();
          resetButton();

          // set customerCreatedFlag Session
          Session.set('customerCreated', true);

          // switch to customer detail
          Router.go('distributors.detail', { _id: result._id });
        }
      });

    } else {
      // load validation errors
    }

  },

  'change #manualInput': FS.EventHandlers.insertFiles(UserImages, {
    metadata: function (fileObj) {
      return {
        owner: Session.get('newCustomerRandomId'),
        tenantId: Core.getTenantId()
      };
    },
    after: function (error, fileObj) {
      if (error) {
        if (error.reason) {
          toastr.error(error.reason, 'Error')
        } else {
          toastr.warning("Invalid file format selected or file too large", "Warning")
        }
      } else {
        let images = UserImages.find({owner: fileObj.owner, _id: {$ne: fileObj._id}}).fetch();
        _.each(images, function (i) {
          i.remove()
        });
        toastr.success('File successfully uploaded', 'Success')
      }
    }
  }),

  'click #new-customer-group': function (event, tmpl) {
    event.preventDefault();
    Modal.show('DistributorsGroupCreate');
  },

  'blur input[name=customer-name]': function (event, tmpl) {
    let name = tmpl.$('[name=customer-name]').val().trim();
    let customer = tmpl.getCustomer();
    customer.name = name.length > 0 ? name : null;
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-email]': function (event, tmpl) {
    let email = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    if (email.length > 0) {
      customer.email = email;
    } else {
      delete customer.email;
    }
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-phone]': function (event, tmpl) {
    let phone = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    if (phone.length > 0) {
      customer.phone = phone;
    } else {
      delete customer.phone;
    }
    tmpl.setCustomer(customer, true);
  },
  'change [name=select-customer-type]': function(e, tmpl) {
    let value = tmpl.$('[name=select-customer-type]').val();
    let customer = tmpl.getCustomer();
    customer.customerType = value;
    tmpl.setCustomer(customer);
  },
  'change [name=select-customer-group]': function(e, tmpl) {
    let value = tmpl.$('[name=select-customer-group]').val().trim();
    let customer = tmpl.getCustomer();
    customer.groupCode = value;
    tmpl.setCustomer(customer);
  },

  'blur input[name=customer-company-name]': function (event, tmpl) {
    let name = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    if (name.length > 0) {
      customer.company.name = name;
    } else {
      delete customer.company.name;
    }
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-company-address]': function (event, tmpl) {
    let address = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    if (address.length > 0) {
      customer.company.address = address;
    } else {
      delete customer.company.address;
    }
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-company-phone]': function (event, tmpl) {
    let phone = tmpl.$('[name=customer-company-phone]').val();
    let customer = tmpl.getCustomer();
    if (phone.length > 0) {
      customer.company.phone = phone;
    } else {
      delete customer.company.phone;
    }
    tmpl.setCustomer(customer, true);
  },

  'blur input.customer-address-items': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let column = event.currentTarget.dataset.column;
    let value = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    var addressBook = _.find(customer.addressBook, function (singleAddress) {
      return singleAddress._id === id;
    });
    if (addressBook && value.length > 0) {
      addressBook[column] = value;
    } else {
      delete addressBook[column];
    }
    tmpl.setCustomer(customer, true);
  },

  'click [name=btnAddItem]': function (event, tmpl) {
    let customer = tmpl.getCustomer();
    customer.addressBook.push({
      _id: Random.id(),
      country: Core.getTenantCountry(),
      isCommercial: true,
      isShippingDefault: customer.addressBook.length === 0,
      isBillingDefault: customer.addressBook.length === 0,
    });
    tmpl.setCustomer(customer);
  },
  'click .remove-item': function(event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let customer = tmpl.getCustomer();
    customer.addressBook = _.reject(customer.addressBook, function (address) {
      return address._id === id;
    });
    tmpl.setCustomer(customer);
  },
  'change [name=shipping]': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let customer = tmpl.getCustomer();
    _.each(customer.addressBook, function (address) {
      address.isShippingDefault = address._id === id;
    });
    tmpl.setCustomer(customer);
  },
  'change [name=billing]': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let customer = tmpl.getCustomer();
    _.each(customer.addressBook, function (address) {
      address.isBillingDefault = address._id === id;
    });
    tmpl.setCustomer(customer);
  }
});

/*****************************************************************************/
/* DistributorsCreate: Helpers */
/*****************************************************************************/
Template.DistributorsCreate.helpers({
  customer: function() {
    return Template.instance().getCustomer();
  },
  customerTypes: function () {
    return ["distributor", "wholesaler", "retailer", "consumer"];
    // return OrderTypes.find().fetch();
  },
  customerGroups: function () {
    // return Template.instance().customerGroups();
    return CustomerGroups.find();
  },
  getCheckedStatus: function (checkedStatus) {
    return checkedStatus ? 'checked' : '';
  },
  disableSubmit: function() {
    let customerContext = Core.Schemas.Customer.namedContext("customerForm");
    return customerContext.isValid() ? '' : 'disabled';
  },
  avatar: function () {
    return UserImages.findOne({owner: Session.get('newCustomerRandomId')});
  },
});

/*****************************************************************************/
/* DistributorsCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsCreate.onCreated(function () {

  let instance = this;

  /*
  * Template instance functions
  * */

  Session.set('customerCreated', false);
  Session.set('newCustomerRandomId', Random.id());

  // function to return draft customer
  instance.resetDraftCustomer = function () {
    let currency = {};
    if (_.isString(Core.getTenantBaseCurrency())) {
      //legacy, handle
      currency.iso = Core.getTenantBaseCurrency();
      currency.symbol = "₦";
    } else {
      currency = Core.getTenantBaseCurrency() || {};
    }

    // create new customer and set defaults
    let customer = {
      _id: Session.get('newCustomerRandomId'),
      currency: currency,
      addressBook: [{
        _id: Random.id(),
        country: Core.getTenantCountry(),
        isCommercial: true,
        isShippingDefault: true,
        isBillingDefault: true,
      }],
      company: {},
      locale: 'en',
      direct: true,
      blocked: false,
      customerType: 'distributor',
      groupCode: CustomerGroups.findOne().code,
      defaultAssigneeId: Meteor.userId(),
      defaultTaxRate: Core.getTenantTaxRate(),
      createdAt: new Date,
    };
    Session.set('draftCustomer', customer);
    return customer;
  };

  // function to fetch draft customer (create new customer if it does not exist)
  instance.getCustomer = function () {
    //retrieve or create new customer shell
    let customer = Session.get('draftCustomer');
    if (!customer) {
      customer = instance.resetDraftCustomer();
    } else {
      customer.createdAt = !customer.createdAt ? new Date : customer.createdAt;
    }
    return customer;
  };

  // function to save customer in reactive variable
  instance.setCustomer = function (customer, noRefresh) {
    customer.noRefresh = !!noRefresh;
    _.each(customer.addressBook, function (address) {
      address.fullName = customer.name;
    });
    Session.set('draftCustomer', customer);
  };

  // function to remove unnecessary fields from customer object
  instance.cleanCustomer = function (customer) {
    delete customer.noRefresh;
    return customer;
  };

  // create validation context
  let customerContext = Core.Schemas.Customer.namedContext("customerForm");

  instance.autorun(function () {

    instance.subscribe('UserImages', Session.get('newCustomerRandomId'));

    let strippedCustomer = instance.cleanCustomer(instance.getCustomer());
    customerContext.validate(strippedCustomer);

    let customer = instance.getCustomer();
    instance.setCustomer(customer);

  });

});

Template.DistributorsCreate.onRendered(function () {
});

Template.DistributorsCreate.onDestroyed(function () {
  let customerId = Session.get('newCustomerRandomId');
  let customerCreatedFlag = Session.get('customerCreated');
  if (customerId && !customerCreatedFlag) {
    let images = UserImages.find({owner: customerId}).fetch();
    _.each(images, function (image) {
      image.remove();
    });
  }
  Session.set('newCustomerRandomId', undefined);
  Session.set('draftCustomer', undefined);
});


