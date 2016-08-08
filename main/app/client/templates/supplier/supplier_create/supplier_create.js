import Ladda from 'ladda';

/*****************************************************************************/
/* SupplierCreate: Event Handlers */
/*****************************************************************************/
Template.SupplierCreate.events({

  'click #create-supplier': function (e, tmpl) {
    e.preventDefault();
    let supplierContext = Core.Schemas.Supplier.namedContext("supplierForm");
    if (supplierContext.isValid()) {

      let supplier = tmpl.cleanSupplier(tmpl.getSupplier());
      // Load button animation
      tmpl.$('#create-supplier').text('Saving... ');
      tmpl.$('#create-supplier').attr('disabled', true);

      try {
        let l = Ladda.create(tmpl.$('#create-supplier')[0]);
        l.start();
      } catch (e) {
        console.log(e);
      }

      let resetButton = function () {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#create-supplier')[0]);
          l.stop();
          l.remove();
        } catch (e) {
          console.log(e);
        }

        tmpl.$('#create-supplier').text('Save');
        tmpl.$('#create-supplier').removeAttr('disabled');
      };

      Meteor.call('suppliers/createSupplier', supplier, function (error, result) {
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
            text: `Supplier ${result.supplierNumber} has been created`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });

          // wipe slate clean
          tmpl.resetDraftSupplier();
          resetButton();

          // set customerCreatedFlag Session
          Session.set('supplierCreated', true);

          if (Session.get('fromPurchaseOrder')) {
            Router.go('purchaseOrders.create');
          } else {
            Router.go('suppliers.list');
          }
        }
      });

    } else {
      // load validation errors
    }

  },

  'click #cancel-create-supplier': function (e, tmpl) {
    swal({
        title: "Are you sure?",
        text: "You will lose your entries!",
        type: "warning",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonClass: "btn-danger",
        confirmButtonText: "Yes, exit!",
        closeOnConfirm: false
      },
      function () {
        swal({
          title: "Cancelled",
          text: "Your draft supplier has been deleted.",
          confirmButtonClass: "btn-info",
          type: "info",
          confirmButtonText: "OK"
        });
        if (Session.get('fromPurchaseOrder')) {
          Router.go('purchaseOrders.create');
        } else {
          Router.go('suppliers.list');
        }
      });
  },

  'input #txtSupplierSearch': function (e, tmpl) {
    let $input = tmpl.$('#txtSupplierSearch');
    let searchText = $input.val();

    if (searchText.length >= 3) {
      Meteor.call('companies/getCompanies', searchText, function (error, companies) {
        if (error) {
          console.log('Error: ' + error);
        } else {
          let objects = [];
          let i = 0;
          _.forEach(companies, function (company) {
            let displayText = company.name || company.description;
            displayText = (displayText && displayText.length > 42) ? displayText.substring(0, 42) + '...' : displayText;
            objects[i++] = {id: company._id, name: displayText, object: company};
          });
          let res = $('#divSupplierSearch');
          $(res).html('');
          _.forEach(objects, function (el) {
            $(res).append('' +
              '<div class="company-search-elem" data-id="' + el['id'] + '" data-name="' + el['name'] + '"><div>' +
              '<div class="col-sm-10 col-xs-10 n-side-padding">' + el['name'] + '</div>' +
              '<div class="col-sm-2 col-xs-2 n-side-padding fs11 text-right">' +
              /*'<span class="text-muted"><a href="' + Router.path('distributors.detail', { _id: el['id'] }) + '" data-id="' + el['id'] + '" class="suplier-link">View</a></span>' +*/
              '</div>' +
              '<div class="clearfix"></div>' +
              '</div><div class="clearfix"></div></div>'
            );
          });
          if (companies && companies.length > 0) {
            $(res).show();
          } else {
            $(res).hide();
          }
        }
      });
    } else {
      $(`#divSupplierSearch`).hide();
    }

  },

  'blur input.company-search': function (e, tmpl) {
    // $(element).is(":visible");
    if ($('.company-search-result').is(':visible')) {
      setTimeout(function () {
        $('.company-search-result').hide();
      }, 100);
    } else {
      let supplier = tmpl.getSupplier();
      let name = tmpl.$('#txtSupplierSearch').val().trim();
      if (name.length > 0) {
        supplier.name = name;
      } else {
        delete supplier.name;
      }
      tmpl.setSupplier(supplier, true);
    }
  },

  'click .company-search-elem, mousedown .company-search-elem': function (e, tmpl) {
    let companyData = e.currentTarget.dataset;
    Meteor.call('companies/getSingleCompany', companyData.id, function (error, response) {
      if (error) {
        console.log(error);
      } else {
        let supplier = tmpl.getSupplier();
        supplier.addressBook = response.addressBook;
        supplier.name = response.name;
        supplier.email = response.email;
        supplier.phone = response.phone;
        tmpl.$('#txtSupplierSearch').val(response.name);
        tmpl.setSupplier(supplier, true);
      }
    });
  },

  'change #manualInput': FS.EventHandlers.insertFiles(UserImages, {
    metadata: function (fileObj) {
      return {
        owner: Session.get('newSupplierRandomId'),
        tenantId: Core.getTenantId()
      };
    },
    after: function (error, fileObj) {
      if (error) {
        if (error.reason) {
          toastr.error(error.reason, 'Error');
        } else {
          toastr.warning("Invalid file format selected or file too large", "Warning");
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

  'blur input[name=supplier-name]': function (event, tmpl) {
    let name = tmpl.$('[name=supplier-name]').val().trim();
    let supplier = tmpl.getSupplier();
    supplier.name = name.length > 0 ? name : null;
    tmpl.setSupplier(supplier, true);
  },
  'blur input[name=supplier-email]': function (event, tmpl) {
    let email = event.currentTarget.value.trim();
    let supplier = tmpl.getSupplier();
    if (email.length > 0) {
      supplier.email = email;
    } else {
      delete supplier.email;
    }
    tmpl.setSupplier(supplier, true);
  },
  'blur input[name=supplier-phone]': function (event, tmpl) {
    let phone = event.currentTarget.value.trim();
    let supplier = tmpl.getSupplier();
    if (phone.length > 0) {
      supplier.phone = phone;
    } else {
      delete supplier.phone;
    }
    tmpl.setSupplier(supplier, true);
  },

  'blur input.supplier-address-items': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let column = event.currentTarget.dataset.column;
    let value = event.currentTarget.value.trim();
    let supplier = tmpl.getSupplier();
    var addressBook = _.find(supplier.addressBook, function (singleAddress) {
      return singleAddress._id === id;
    });
    if (addressBook && value.length > 0) {
      addressBook[column] = value;
    } else {
      delete addressBook[column];
    }
    tmpl.setSupplier(supplier, true);
  },

  'click [name=btnAddItem]': function (event, tmpl) {
    let supplier = tmpl.getSupplier();
    supplier.addressBook.push({
      _id: Random.id(),
      country: Core.getTenantCountry(),
      isCommercial: true,
      isShippingDefault: supplier.addressBook.length === 0,
      isBillingDefault: supplier.addressBook.length === 0,
    });
    tmpl.setSupplier(supplier);
  },
  'click .remove-item': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let supplier = tmpl.getSupplier();
    supplier.addressBook = _.reject(supplier.addressBook, function (address) {
      return address._id === id;
    });
    tmpl.setSupplier(supplier);
  },
  'change [name=shipping]': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let supplier = tmpl.getSupplier();
    _.each(supplier.addressBook, function (address) {
      address.isShippingDefault = address._id === id;
    });
    tmpl.setSupplier(supplier);
  },
  'change [name=billing]': function (event, tmpl) {
    let id = event.currentTarget.dataset.id;
    let supplier = tmpl.getSupplier();
    _.each(supplier.addressBook, function (address) {
      address.isBillingDefault = address._id === id;
    });
    tmpl.setSupplier(supplier);
  }
});

/*****************************************************************************/
/* SupplierCreate: Helpers */
/*****************************************************************************/
Template.SupplierCreate.helpers({
  supplier: function () {
    return Template.instance().getSupplier();
  },
  getCheckedStatus: function (checkedStatus) {
    return checkedStatus ? 'checked' : '';
  },
  disableSubmit: function () {
    let supplierContext = Core.Schemas.Supplier.namedContext("supplierForm");
    return supplierContext.isValid() ? '' : 'disabled';
  },
  avatar: function () {
    return UserImages.findOne({owner: Session.get('newSupplierRandomId')});
  }
});

/*****************************************************************************/
/* SupplierCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.SupplierCreate.onCreated(function () {

  let instance = this;

  /*
   * Template instance functions
   * */

  Session.set('supplierCreated', false);
  Session.set('newSupplierRandomId', Random.id());

  // function to return draft customer
  instance.resetDraftSupplier = function () {
    let currency = {};
    if (_.isString(Core.getTenantBaseCurrency())) {
      //legacy, handle
      currency.iso = Core.getTenantBaseCurrency();
      currency.symbol = "₦";
    } else {
      currency = Core.getTenantBaseCurrency() || {};
    }

    // create new customer and set defaults
    let supplier = {
      _id: Session.get('newSupplierRandomId'),
      currency: currency,
      locale: 'en',
      addressBook: [{
        _id: Random.id(),
        country: Core.getTenantCountry(),
        isCommercial: true,
        isShippingDefault: true,
        isBillingDefault: true,
      }],
      blocked: false,
      direct: true,
      status: 'active',
      defaultTaxRate: Core.getTenantTaxRate(),
      createdAt: new Date,
    };
    Session.set('draftSupplier', supplier);
    return supplier;
  };

  // function to fetch draft customer (create new customer if it does not exist)
  instance.getSupplier = function () {
    //retrieve or create new customer shell
    let supplier = Session.get('draftSupplier');
    if (!supplier) {
      supplier = instance.resetDraftSupplier();
    } else {
      supplier.createdAt = !supplier.createdAt ? new Date : supplier.createdAt;
    }
    return supplier;
  };

  // function to save customer in reactive variable
  instance.setSupplier = function (supplier, noRefresh) {
    supplier.noRefresh = !!noRefresh;
    _.each(supplier.addressBook, function (address) {
      address.fullName = supplier.name;
    });
    Session.set('draftSupplier', supplier);
  };

  // function to remove unnecessary fields from customer object
  instance.cleanSupplier = function (supplier) {
    delete supplier.noRefresh;
    return supplier;
  };

  // create validation context
  let supplierContext = Core.Schemas.Supplier.namedContext("supplierForm");

  instance.autorun(function () {

    instance.subscribe('UserImages', Session.get('newSupplierRandomId'));

    let strippedSupplier = instance.cleanSupplier(instance.getSupplier());
    supplierContext.validate(strippedSupplier);

    let supplier = instance.getSupplier();
    instance.setSupplier(supplier);

  });

});

Template.SupplierCreate.onRendered(function () {
});

Template.SupplierCreate.onDestroyed(function () {
  let supplierId = Session.get('newSupplierRandomId');
  let supplierCreatedFlag = Session.get('supplierCreated');
  if (supplierId && !supplierCreatedFlag) {
    let images = UserImages.find({owner: supplierId}).fetch();
    _.each(images, function (image) {
      image.remove();
    });
  }
  Session.set('newSupplierRandomId', undefined);
  Session.set('draftSupplier', undefined);
  Session.set('fromPurchaseOrder', undefined);
});

