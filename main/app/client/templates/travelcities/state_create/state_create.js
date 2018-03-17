/*****************************************************************************/
/* HotelCreate: Event Handlers */
/***************************************************************************/
Template.TravelCityCreate.events({
    'click #new-travelcity-close': (e, tmpl) => {
      Modal.hide('TravelCityCreate');
    },
    'click #save': (e, tmpl) => {
      let travelcityPerdiem = $('[name=travelcity-perdiem]').val();
      let travelcityName = $('[name=travelcity-name]').val();
      let travelcitycurrency= $('[name="currency"]').val();

      if (!travelcityPerdiem || travelcityPerdiem.trim().length === 0) {
        Template.instance().errorMessage.set("Please enter the state perdiem");
      } else if(!travelcityName || travelcityName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the state name");
      } else {
        Template.instance().errorMessage.set(null);
  
        let newTravelcity = {
          businessId: Session.get('context'),
          perdiem : travelcityPerdiem,
          name : travelcityName

        };
  
        Meteor.call('travelcity/create', newTravelcity, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New state added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('TravelCityCreate');
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
  Template.TravelCityCreate.helpers({
    selected(context,val) {
      let self = this;
  
      if(Template.instance().data){
          //get value of the option element
          //check and return selected if the template instce of data.context == self._id matches
          if(val){
              return Template.instance().data[context] === val ? selected="selected" : '';
          }
          return Template.instance().data[context] === self._id ? selected="selected" : '';
      }
  },
    'errorMessage': function() {
      return Template.instance().errorMessage.get()
    }
  });
  
  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.TravelCityCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
  });
  
  Template.TravelCityCreate.onRendered(function () {
  });
  
  Template.TravelCityCreate.onDestroyed(function () {
  });
  