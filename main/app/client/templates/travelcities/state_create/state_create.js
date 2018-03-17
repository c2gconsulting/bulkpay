/*****************************************************************************/
/* HotelCreate: Event Handlers */
/***************************************************************************/
Template.TravelCityCreate.events({
    'click #new-travelcity-close': (e, tmpl) => {
      Modal.hide('TravelCityCreate');
    },
    'click #save': (e, tmpl) => {
      let perdiem = $('[name=perdiem]').val();
      let name = $('[name=name]').val();
      let currency= $('[name=currency]').val();

      // if (!Perdiem || Perdiem.trim().length === 0) {
      //   Template.instance().errorMessage.set("Please enter the state perdiem");
      // } else if(!Name || Name.trim().length === 0) {
      //     Template.instance().errorMessage.set("Please enter the state name");
      // } else {
        Template.instance().errorMessage.set(null);
  
        let newTravelcity = {
          businessId: Session.get('context'),
          perdiem : perdiem,
          name : name,
          currency : currency

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
  