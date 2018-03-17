/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.FlightrouteCreate.events({
    'click #new-flightroute-close': (e, tmpl) => {
      Modal.hide('FlightrouteCreate');
    },
    'click #save': (e, tmpl) => {
  
      let fromId =  $('[name="fromId"]').val()
      let toId =  $('[name="toId"]').val()
      let airlineId =  $('[name="airlineId"]').val()
      let currency= $('[name="currency"]').val();
      let cost =  parseFloat($('[name=cost]').val());

     // console.log('flightrouteTravelcity :', flightrouteTravelcity);
  
    //   if (!flightrouteCost || flightrouteCost.trim().length === 0) {
    //     Template.instance().errorMessage.set("Please enter the flightroute cost");
    // //   } 
    //   } 
    //   else {
        Template.instance().errorMessage.set(null);
  
        let newFlightroute = {
          businessId: Session.get('context'),
          fromId: fromId,
          toId : toId,
          airlineId : airlineId,
          currency : currency,
          cost :cost
          

        };
   

        // let hotelContext = Core.Schemas.Hotel.namedContext("hotelForm");
        // hotelContext.validate(newHotel);
        // if (hotelContext.isValid()) {
        //     console.log('Hotel is Valid!');
        // } else {
        //     console.log('Hotel is not Valid!');
        // }
        // console.log(hotelContext._invalidKeys);
  
        Meteor.call('flightroute/create', newFlightroute, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New flightroute added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('FlightrouteCreate');
            } else {
                console.log(err);
            }
        });
      
    },
  });
  
  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.FlightrouteCreate.helpers({
    travelcityList() {
        return  Travelcities.find();
   },
   airlineList() {
    return  Airlines.find();
},
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
  Template.FlightrouteCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
    


  });
  
  Template.FlightrouteCreate.onRendered(function () {
  });
  
  Template.FlightrouteCreate.onDestroyed(function () {
  });
  