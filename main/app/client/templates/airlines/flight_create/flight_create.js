/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.AirlineCreate.events({
    'click #new-airline-close': (e, tmpl) => {
      Modal.hide('AirlineCreate');
    },
    'click #save': (e, tmpl) => {
   //   let airlineCode = $('[name=airline-code]').val();
      let airlineName = $('[name=airline-name]').val();
      
     
    
     // employees: Core.returnSelection($('[name="employee"]')),
 
  
     // if (!airlineCode || airlineCode.trim().length === 0) {
       // Template.instance().errorMessage.set("Please enter the Airline code");
    /*} else */if(!airlineName || airlineName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the Airline name");
      } 
      else {
        Template.instance().errorMessage.set(null);
  
        let newAirline = {
          businessId: Session.get('context'),
        //   code : airlineCode,
          name : airlineName,
       
      
        };

       /* let flightContext = Core.Schemas.FLight.namedContext("flightForm");
        flightContext.validate(newFlight);
        if (flightContext.isValid()) {
            console.log('Hotel is Valid!');
        } else {
            console.log('Hotel is not Valid!');
        }
        console.log(flightContext._invalidKeys);*/
  
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
    }
  });
  
  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.AirlineCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)

 
  });
  
  Template.AirlineCreate.onRendered(function () {
  });
  
  Template.AirlineCreate.onDestroyed(function () {
  });
  