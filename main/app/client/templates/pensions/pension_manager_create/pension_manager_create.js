/*****************************************************************************/
/* PensionManagerCreate: Event Handlers */
/*****************************************************************************/
Template.PensionManagerCreate.events({
  'click #new-pension-manager-close': (e, tmpl) => {
    Modal.hide('PensionManagerCreate');
  },
  'click #save': (e, tmpl) => {
    let pensionManagerCode = $('[name=pension-manager-code]').val();
    let pensionManagerName = $('[name=pension-manager-name]').val();

    if (!pensionManagerCode || pensionManagerCode.trim().length === 0) {
      Session.set('errorMessage', "Please enter the pension manager code");
    } else if(!pensionManagerName || pensionManagerName.trim().length === 0) {
        Session.set('errorMessage', "Please enter the pension manager name");
    } else {
      Session.set('errorMessage', null);
      let newPensionManager = {
        businessId: Session.get('context'),
        code : pensionManagerCode,
        name : pensionManagerName
      };

      Meteor.call('pensionManager/create', newPensionManager, (err, res) => {
          if (res){
              swal({
                  title: "Success",
                  text: `New pension manager added`,
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
              Modal.hide('PensionManagerCreate');
          } else {
              console.log(err);
          }
      });
    }
  },
});

/*****************************************************************************/
/* PensionManagerCreate: Helpers */
/*****************************************************************************/
Template.PensionManagerCreate.helpers({
  'errorMessage': function() {
    return Session.get('errorMessage');
  }
});

/*****************************************************************************/
/* PensionManagerCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionManagerCreate.onCreated(function () {
});

Template.PensionManagerCreate.onRendered(function () {
});

Template.PensionManagerCreate.onDestroyed(function () {
});
