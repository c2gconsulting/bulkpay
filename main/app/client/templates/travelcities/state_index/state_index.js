/*****************************************************************************/
/* HotelIndex: Event Handlers */
/**************************************************************************/
Template.TravelCityIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('TravelCityCreate');
    },
    'click #uploadTravelCity': function(e){
        e.preventDefault();
        Modal.show('ImportTravelCityModal');
    },
});

/*****************************************************************************/
/* Hotels: Helpers */
/*****************************************************************************/
Template.TravelCityIndex.helpers({
    'pfas': function(){
      let allPfas = Travelcities.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Travelcities.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.TravelCityIndex.onCreated(function () {
    let self = this;
  self.subscribe("travelcities", Session.get('context'));
});

Template.TravelCityIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.TravelCityIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleTravelcity.events({
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
            const travelcityId = self.data._id;
            const perdiem = self.data.perdiem;

            Meteor.call('travelcity/delete', travelcityId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Travelcity: ${perdiem} has been deleted.`, "success");
                }
            });
        });
    }
})
