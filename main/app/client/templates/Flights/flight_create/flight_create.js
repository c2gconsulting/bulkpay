/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.FlightCreate.events({
    'click #new-flight-close': (e, tmpl) => {
      Modal.hide('FlightCreate');
    },
    'click #save': (e, tmpl) => {
      let flightCode = $('[name=flight-code]').val();
      let flightName = $('[name=flight-name]').val();
      
     
    
     // employees: Core.returnSelection($('[name="employee"]')),
 
  
      if (!flightCode || flightCode.trim().length === 0) {
        Template.instance().errorMessage.set("Please enter the flight code");
      } else if(!flightName || flightName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the flight name");
      } 
      else {
        Template.instance().errorMessage.set(null);
  
        let newFlight = {
          businessId: Session.get('context'),
          code : flightCode,
          name : flightName,
       
      
        };

       /* let flightContext = Core.Schemas.FLight.namedContext("flightForm");
        flightContext.validate(newFlight);
        if (flightContext.isValid()) {
            console.log('Hotel is Valid!');
        } else {
            console.log('Hotel is not Valid!');
        }
        console.log(flightContext._invalidKeys);*/
  
        Meteor.call('flight/create', newFlight, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New Airline added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('FlightCreate');
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
  Template.FlightCreate.helpers({  
 
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
  Template.FlightCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)

 
  });
  
  Template.FlightCreate.onRendered(function () {
  });
  
  Template.FlightCreate.onDestroyed(function () {
  });
  