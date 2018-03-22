/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.HotelCreate.events({
    'click #new-hotel-close': (e, tmpl) => {
      Modal.hide('HotelCreate');
    },
    'click #save': (e, tmpl) => {
      let dailyRate = parseFloat($('[name=dailyRate]').val());
      let name = $('[name=name]').val();
      let travelcityId =  $('[name=travelcityId]').val()
      let currency = $('[name=currency]').val();
      console.log('currency:' + currency);
  
        Template.instance().errorMessage.set(null);
  
        let newHotel = {
          businessId: Session.get('context'),
          dailyRate : dailyRate,
          name : name,
          travelcityId : travelcityId,
          currency : currency
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
      
    },
  });
  
  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.HotelCreate.helpers({
    travelcityList() {
        return  Travelcities.find();
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
    self.subscribe("travelcities", Session.get('context'));
  });
  
  Template.HotelCreate.onRendered(function () {
  });
  
  Template.HotelCreate.onDestroyed(function () {
  });
  