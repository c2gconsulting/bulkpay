/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.HotelIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('HotelCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/*****************************************************************************/
Template.HotelIndex.helpers({
    'pfas': function(){
      let allPfas = Hotels.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Hotels.find().count();
    },

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.HotelIndex.onCreated(function () {
    let self = this;
    self.subscribe("hotels", Session.get('context'));
    self.subscribe("travelcities", Session.get('context'));
});

Template.HotelIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.HotelIndex.onDestroyed(function () {
});

/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleHotel.events({
    'click .pointer': function(e, tmpl){
        e.preventDefault();
        Modal.show('HotelCreate', this.data);
    }
})
Template.singleHotel.helpers({
       
    'getTravelcityName': function(travelcityId, country) {
        const travelcity = Travelcities.findOne({_id: travelcityId})
        if(travelcity) {
            return travelcity.name
        }
    }
});
