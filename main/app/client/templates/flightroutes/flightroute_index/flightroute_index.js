/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.FlightrouteIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('FlightrouteCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/*****************************************************************************/
Template.FlightrouteIndex.helpers({
    'pfas': function(){
      let allPfas = Flightroutes.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Flightroutes.find().count();
    },
    
});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.FlightrouteIndex.onCreated(function () {
    let self = this;
    self.subscribe("flightroutes", Session.get('context'));
    self.subscribe("travelcities", Session.get('context'));
    self.subscribe("airlines", Session.get('context'));
});

Template.FlightrouteIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.FlightrouteIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleFlightroute.events({
   'click #deleteFlightroute': function(e, tmpl) {
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
         }, () => {             const flightrouteId = self.data._id;
             const code = self.data.code;

            Meteor.call('flightroute/delete', flightrouteId, (err, res) => {
                 if(!err){
                     Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                 }
             });
         });
     }
 })
Template.singleFlightroute.helpers({
   
         'getTravelcityName': function(travelcityId) {
       const travelcity = Travelcities.findOne({_id: travelcityId})
         if(travelcity) {
             return travelcity.name
         }
         
     },
     'getAirlineName': function(airlineId) {
        const airline = Airlines.findOne({_id: airlineId})
          if(airline) {
              return airline.name
          }
        }
 });