/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.HotelCreate.events({
    'click #new-hotel-close': (e, tmpl) => {
      Modal.hide('HotelCreate');
    },
    'click #deleteHotel': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Hotel",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const hotelId = self._id;
            const code = self.code;

            Meteor.call('hotel/delete', hotelId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                }
            });
        });
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
  
        e.preventDefault();
        let l = Ladda.create(tmpl.$('#save')[0]);
        l.start();

        Meteor.call('hotel/create', newHotel, (err, res) => {
          l.stop();
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
                swal("Save Failed", "Unable to Save Hotel", "error");
            }
        });
      
    },
    'click #update': (e, tmpl) => {
      let dailyRate = parseFloat($('[name=dailyRate]').val());
      let name = $('[name=name]').val();
      let travelcityId =  $('[name=travelcityId]').val()
      let currency = $('[name=currency]').val();
      console.log('currency:' + currency);
  
        Template.instance().errorMessage.set(null);
  
        let updatedHotel = {
          businessId: Session.get('context'),
          dailyRate : dailyRate,
          name : name,
          travelcityId : travelcityId,
          currency : currency
        };
        
        e.preventDefault();
        let l = Ladda.create(tmpl.$('#update')[0]);
        l.start();

        let hotelContext = Core.Schemas.Hotel.namedContext("hotelForm");
        hotelContext.validate(updatedHotel);
        if (hotelContext.isValid()) {
            console.log('Hotel is Valid!');
        } else {
            console.log('Hotel is not Valid!');
        }
        console.log(hotelContext._invalidKeys);
  
        Meteor.call('hotel/update', tmpl.data._id, updatedHotel, (err, res) => {
          l.stop();
            if (res){
              swal({
                title: "Success",
                text: `Hotel Updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('HotelCreate');
            } else {
              console.log(err);
                swal("Update Failed", "Cannot Update Hotel", "error");
            }
        });
      
    }
  });
  
  /*****************************************************************************/
  /* HotelCreate: Helpers */
  /*****************************************************************************/
  Template.HotelCreate.helpers({
    travelcityList() {
        return  Travelcities.find();
    },
   'edit': () => {
    return Template.instance().data ? true:false;
    //use ReactiveVar or reactivedict instead of sessions..
    },
    'hotel': () => {
        return Template.instance().data.name;
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
  