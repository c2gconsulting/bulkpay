/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.FlightIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('FlightCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/***************************************************************************/
Template.FlightIndex.helpers({
    'pfas': function(){
      let allPfas = Flights.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Flights.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.FlightIndex.onCreated(function () {
    let self = this;
    self.subscribe("flights", Session.get('context'));
});

Template.FlightIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.FlightIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleFlight.events({
    'click #deleteFlight': function(e, tmpl) {
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
            const flightId = self.data._id;
            const code = self.data.code;

            Meteor.call('flight/delete', flightId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
