/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.AirlineCreate.events({
    'click #new-airline-close': (e, tmpl) => {
      Modal.hide('AirlineCreate');
    },
    'click #save': (e, tmpl) => {

      let airlineName = $('[name=airline-name]').val();
      let isInternational = $('#isInternational').is(':checked');



     if(!airlineName || airlineName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the Airline name");
      }
      else {
        Template.instance().errorMessage.set(null);

        let newAirline = {
          businessId: Session.get('context'),
          name : airlineName,
          isInternational: isInternational
        };



        Meteor.call('airline/create', newAirline, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New Airline added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('AirlineCreate');
            } else {
                console.log(err);
            }
        });
      }
    },
    'click #update': (e, tmpl) => {

      let airlineName = $('[name=airline-name]').val();
      let isInternational = $('#isInternational').is(':checked');



     if(!airlineName || airlineName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the Airline name");
      }
      else {
        Template.instance().errorMessage.set(null);

        let newAirline = {
          businessId: Session.get('context'),
          name : airlineName,
          isInternational: isInternational
        };



        Meteor.call('airline/update', tmpl.data._id, newAirline, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Airline Updated`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('AirlineCreate');
            } else {
                console.log(err);
            }
        });
      }
    },
    'click #deleteAirline': function(e, tmpl) {
      event.preventDefault();
      let self = this;

      swal({
          title: "Are you sure?",
          text: "You will not be able to recover this Pension Manager",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
      }, () => {
          const airlineId = self.data._id;
          const code = self.data.code;

          Meteor.call('airline/delete', airlineId, (err, res) => {
              if(!err){
                  Modal.hide();
                  swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
              }
          });
      });
  }
  });

  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.AirlineCreate.helpers({

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
  });

  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.AirlineCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.subscribe("airlines", businessUnitId);
  });

  Template.AirlineCreate.onRendered(function () {
  });

  Template.AirlineCreate.onDestroyed(function () {
  });
