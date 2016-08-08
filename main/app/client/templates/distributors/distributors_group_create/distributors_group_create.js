import Ladda from 'ladda';

/*****************************************************************************/
/* DistributorsGroupCreate: Event Handlers */
/*****************************************************************************/
Template.DistributorsGroupCreate.events({
  'click .onoffswitch-checkbox': function(event, tmpl) {
    let value = (event.currentTarget.type === 'checkbox') ? event.currentTarget.checked : event.currentTarget.value;
    let customerGroup = tmpl.getCustomerGroup();
    customerGroup.isPickupDefault = value;
    tmpl.setCustomerGroup(customerGroup, true);
  },
  'blur input[name=new-customer-group-name]': function (event, tmpl) {
    let name = tmpl.$('[name=new-customer-group-name]').val().trim();
    let customerGroup = tmpl.getCustomerGroup();
    customerGroup.name = name.length > 0 ? name : null;
    tmpl.setCustomerGroup(customerGroup, true);
  },
  'blur input[name=new-customer-group-code]': function (event, tmpl) {
    let code = tmpl.$('[name=new-customer-group-code]').val().trim();
    let customerGroup = tmpl.getCustomerGroup();
    customerGroup.code = code.length > 0 ? code : null;
    tmpl.setCustomerGroup(customerGroup, true);
  },
  'click #save-customer-group': function (event, tmpl) {
    event.preventDefault();
    let customerGroupContext = Core.Schemas.CustomerGroup.namedContext("customerGroupForm");
    if (customerGroupContext.isValid()) {

      let customerGroup = tmpl.cleanCustomerGroup(tmpl.getCustomerGroup());
      // Load button animation
      tmpl.$('#save-customer-group').text('Saving... ');
      tmpl.$('#save-customer-group').attr('disabled', true);

      try {
        let l = Ladda.create(tmpl.$('#save-customer-group')[0]);
        l.start();
      } catch(e) {
        console.log(e);
      }

      let resetButton = function () {
        // End button animation
        try {
          let l = Ladda.create(tmpl.$('#save-customer-group')[0]);
          l.stop();
          l.remove();
        } catch(e) {
          console.log(e);
        }

        tmpl.$('#save-customer-group').text('Save');
        tmpl.$('#save-customer-group').removeAttr('disabled');
      };

      Meteor.call('customergroups/create', customerGroup, function (error, result) {
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
          Modal.hide('DistributorsGroupCreate');
          swal({
            title: "Success",
            text: `Customer Group has been created`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });
        }
      });

    } else {
      // load validation errors
    }
  },
});

/*****************************************************************************/
/* DistributorsGroupCreate: Helpers */
/*****************************************************************************/
Template.DistributorsGroupCreate.helpers({
  customerGroup: function() {
    return Template.instance().getCustomerGroup();
  },
  enableSubmit: function () {
    let customerGroupContext = Core.Schemas.CustomerGroup.namedContext("customerGroupForm");
    return customerGroupContext.isValid() ? '' : 'disabled';
  }
});

/*****************************************************************************/
/* DistributorsGroupCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.DistributorsGroupCreate.onCreated(function () {

  let instance = this;

  /*
   * Template instance functions
   * */

  // function to return draft customerGroup
  instance.resetDraftCustomerGroup = function () {

    // create new customerGroup and set defaults
    let customerGroup = {
      isPickupDefault: true
    };
    Session.set('draftCustomerGroup', customerGroup);
    return customerGroup;

  };

  // function to fetch draft customer (create new customer if it does not exist)
  instance.getCustomerGroup = function () {
    //retrieve or create new customer shell
    let customerGroup = Session.get('draftCustomerGroup');
    if (!customerGroup) {
      customerGroup = instance.resetDraftCustomerGroup();
    }
    return customerGroup;
  };

  // function to save customer in reactive variable
  instance.setCustomerGroup = function (customerGroup, noRefresh) {
    customerGroup.noRefresh = !!noRefresh;
    Session.set('draftCustomerGroup', customerGroup);
  };

  // function to remove unnecessary fields from customer object
  instance.cleanCustomerGroup = function (customerGroup) {
    delete customerGroup.noRefresh;
    return customerGroup;
  };


  // create validation context
  let customerGroupContext = Core.Schemas.CustomerGroup.namedContext("customerGroupForm");

  instance.autorun(function () {

    let strippedCustomerGroup = instance.cleanCustomerGroup(instance.getCustomerGroup());
    customerGroupContext.validate(strippedCustomerGroup);

    let customerGroup = instance.getCustomerGroup();
    instance.setCustomerGroup(customerGroup);
  });

});

Template.DistributorsGroupCreate.onRendered(function () {
});

Template.DistributorsGroupCreate.onDestroyed(function () {
  Session.set('draftCustomerGroup', undefined);
});
