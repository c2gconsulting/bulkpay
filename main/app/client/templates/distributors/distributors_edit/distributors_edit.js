import Ladda from 'ladda';

/*****************************************************************************/
/* DistributorsEdit: Event Handlers */
/*****************************************************************************/
Template.DistributorsEdit.events({

  'click #save-customer': function(e, tmpl) {
    e.preventDefault();
    if (Session.get('editCustomerIsValid')) {

      let customer = tmpl.cleanCustomer(tmpl.getCustomer());
      // Load button animation
      tmpl.$('#save-customer').text('Saving... ');
      tmpl.$('#save-customer').attr('disabled', true);

      try {
        let l = Ladda.create(tmpl.$('#save-customer')[0]);
        l.start();
      } catch(e) {
        console.log(e);
      }

      let resetButton = function () {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#save-customer')[0]);
          l.stop();
          l.remove();
        } catch(e) {
          console.log(e);
        }

        tmpl.$('#save-customer').text('Save');
        tmpl.$('#save-customer').removeAttr('disabled');
      };

      Meteor.call('customers/updateCustomer', customer, customer._id, function (error, result) {
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
            text: `Customer ${customer.customerNumber} has been updated`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });

          resetButton();

          // switch to customer detail
          Router.go('distributors.detail', { _id: customer._id });
        }
      });

    } else {
      // load validation errors
    }

  },

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
        Router.go('distributors.detail', {_id: self._id});

      });
  },

  'change #manualInput': FS.EventHandlers.insertFiles(UserImages, {
    metadata: function (fileObj) {
      return {
        owner: Template.instance().getCustomer()._id,
        tenantId: Core.getTenantId()
      };
    },
    after: function (error, fileObj) {
      if (error) {
        if (error.reason) {
          toastr.error(error.reason, 'Error');
        } else {
          toastr.warning("Invalid file format selected or file too large", "Warning")
        }
      } else {
        let images = UserImages.find({owner: fileObj.owner, _id: {$ne: fileObj._id}}).fetch();
        _.each(images, function (i) {
          i.remove();
        });
        toastr.success('File successfully uploaded', 'Success');
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
    customer.email = email;
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-phone]': function (event, tmpl) {
    let phone = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    customer.phone = phone;
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
    customer.company.name = name;
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-company-address]': function (event, tmpl) {
    let address = event.currentTarget.value.trim();
    let customer = tmpl.getCustomer();
    customer.company.address = address;
    tmpl.setCustomer(customer, true);
  },
  'blur input[name=customer-company-phone]': function (event, tmpl) {
    let phone = tmpl.$('[name=customer-company-phone]').val();
    let customer = tmpl.getCustomer();
    customer.company.phone = phone;
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
/* DistributorsEdit: Helpers */
/*****************************************************************************/
Template.DistributorsEdit.helpers({
  customerName: function () {
    return Template.instance().name;
  },
  customer: function () {
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
    return Session.get('editCustomerIsValid') ? '' : 'disabled';
  },
  avatar: function () {
    return UserImages.findOne({owner: Template.parentData()._id});
  },
});

/*****************************************************************************/
/* DistributorsEdit: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsEdit.onCreated(function () {


  let instance = this;

  instance.name = Template.parentData().name;

  Session.set('editCustomer', Template.parentData());
  Session.set('editCustomerIsValid', false);

  // function to fetch return current customer
  instance.getCustomer = function () {
    let customer = Session.get('editCustomer');
    if (!customer.company) {
      customer.company = {};
    }
    return customer;
  };

  // function to save customer in reactive variable
  instance.setCustomer = function (customer, noRefresh) {
    customer.noRefresh = !!noRefresh;
    _.each(customer.addressBook, function (address) {
      address.fullName = customer.name;
    });
    Session.set('editCustomer', customer);
  };

  // function to remove unnecessary fields from customer object
  instance.cleanCustomer = function (customer) {
    delete customer.noRefresh;
    return customer;
  };

  // function to validate editCustomerObject
  instance.validateCustomer = function (customer) {
    let status = true;
    if (!customer.name) {
      status = false;
    }
    if (customer.email && customer.email.length > 0) {
      if (!/^[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)[a-zA-Z-0-9]{2}/.test(customer.email)) {
        status = false;
      }
    }
    _.each(customer.addressBook, function (addressBook) {
      if (!addressBook.fullName || !addressBook.address1) {
        status = false;
      }
    });
    return status;
  };

  instance.autorun(function () {
    instance.subscribe('UserImages', Template.parentData()._id);
    Session.set('editCustomerIsValid', instance.validateCustomer(instance.getCustomer()));
  });

});

Template.DistributorsEdit.onRendered(function () {
});

Template.DistributorsEdit.onDestroyed(function () {
  Session.set('editCustomer', undefined);
  Session.set('editCustomerIsValid', undefined);
});
