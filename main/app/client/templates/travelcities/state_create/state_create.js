/*****************************************************************************/
/* HotelCreate: Event Handlers */
/***************************************************************************/
Template.TravelCityCreate.events({
    'click #new-travelcity-close': (e, tmpl) => {
      Modal.hide('TravelCityCreate');
    },
    'click #save': (e, tmpl) => {
      let perdiem = parseFloat($('[name=perdiem]').val());
      let name = $('[name=name]').val();
      let currency= $('[name=currency]').val();
      let isInternational = $('#isInternational').is(':checked');
      let groundTransport = parseFloat($('[name=groundTransport]').val());
      let airportPickupDropOffCost = parseFloat($('[name=airportPickupDropOffCost]').val());
      let notificationEmail = $('[name=notificationEmail]').val();

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
          currency : currency,
          isInternational: isInternational,
          groundTransport: groundTransport,
          airportPickupDropOffCost: airportPickupDropOffCost,
          notificationEmail: notificationEmail
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
    'click #update': (e, tmpl) => {
      let perdiem = parseFloat($('[name=perdiem]').val());
      let name = $('[name=name]').val();
      let currency= $('[name=currency]').val();
      let isInternational = $('#isInternational').is(':checked');
      let groundTransport = parseFloat($('[name=groundTransport]').val());
      let airportPickupDropOffCost = parseFloat($('[name=airportPickupDropOffCost]').val());
      let notificationEmail = $('[name=notificationEmail]').val();

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
          currency : currency,
          isInternational: isInternational,
          groundTransport: groundTransport,
          airportPickupDropOffCost: airportPickupDropOffCost,
          notificationEmail: notificationEmail
        };

        Meteor.call('travelcity/update', tmpl.data._id, newTravelcity, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `State Updated`,
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
    'click #deleteTravelcity': function(e, tmpl) {
      event.preventDefault();
      let self = this;

      swal({
          title: "Are you sure?",
          text: "You will not be able to recover this Travel city",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
      }, () => {
          const travelcityId = self._id;
          const perdiem = self.perdiem;
          
          
          Meteor.call('travelcity/delete', travelcityId, (err, res) => {
              if(!err){
                  Modal.hide();
                  swal("Deleted!", `Travelcity: ${perdiem} has been deleted.`, "success");
              }
          });
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
    'edit': () => {
      return Template.instance().data ? true:false;
      //use ReactiveVar or reactivedict instead of sessions..
    },
    'checked': (prop) => {
      if(Template.instance().data)
          return Template.instance().data[prop];
      return false;
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
    self.subscribe("travelcities", Session.get('context'));
  });

  Template.TravelCityCreate.onRendered(function () {
  });

  Template.TravelCityCreate.onDestroyed(function () {
  });
