/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.HotelCreate.events({
    'click #new-hotel-close': (e, tmpl) => {
      Modal.hide('HotelCreate');
    },
    'click #save': (e, tmpl) => {
      let hotelCode = $('[name=hotel-code]').val();
      let hotelName = $('[name=hotel-name]').val();
      let hotelState =  $('[name="state"]').val()
      console.log('hotelState :', hotelState);
  
      if (!hotelCode || hotelCode.trim().length === 0) {
        Template.instance().errorMessage.set("Please enter the hotel code");
      } else if(!hotelName || hotelName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the hotel name");
      } 
      else {
        Template.instance().errorMessage.set(null);
  
        let newHotel = {
          businessId: Session.get('context'),
          code : hotelCode,
          name : hotelName,
          stateId : hotelState
        };

        let hotelContext = Core.Schemas.Hotel.namedContext("hotelForm");
        hotelContext.validate(newHotel);
        if (hotelContext.isValid()) {
            console.log('Hotel is Valid!');
        } else {
            console.log('Hotel is not Valid!');
        }
        console.log(hotelContext._invalidKeys);
  
        Meteor.call('hotel/create', newHotel, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New hotel added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('HotelCreate');
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
  Template.HotelCreate.helpers({
    stateList() {
        return States.find();
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
  Template.HotelCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.subscribe("states", Session.get('context'));
  });
  
  Template.HotelCreate.onRendered(function () {
  });
  
  Template.HotelCreate.onDestroyed(function () {
  });
  