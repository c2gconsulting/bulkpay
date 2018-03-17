/*****************************************************************************/
/* HotelCreate: Event Handlers */
/***************************************************************************/
Template.StateCreate.events({
    'click #new-state-close': (e, tmpl) => {
      Modal.hide('StateCreate');
    },
    'click #save': (e, tmpl) => {
      let stateCode = $('[name=state-code]').val();
      let stateName = $('[name=state-name]').val();

      if (!stateCode || stateCode.trim().length === 0) {
        Template.instance().errorMessage.set("Please enter the state code");
      } else if(!stateName || stateName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the state name");
      } else {
        Template.instance().errorMessage.set(null);
  
        let newState = {
          businessId: Session.get('context'),
          code : stateCode,
          name : stateName
        };
  
        Meteor.call('state/create', newState, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New state added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('StateCreate');
            } else {
                console.log(err);
            }
        });
      }
    },
  });
  
  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.StateCreate.helpers({
    'errorMessage': function() {
      return Template.instance().errorMessage.get()
    }
  });
  
  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.StateCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
  });
  
  Template.StateCreate.onRendered(function () {
  });
  
  Template.StateCreate.onDestroyed(function () {
  });
  