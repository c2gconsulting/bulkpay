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
    self.subscribe("states", Session.get('context'));
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
    'click #deleteHotel': function(e, tmpl) {
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
            const hotelId = self.data._id;
            const code = self.data.code;

            Meteor.call('hotel/delete', hotelId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
Template.singleHotel.helpers({
   
    
    'getStateName': function(stateId) {
        const state = States.findOne({_id: stateId})
        if(state) {
            return state.name
        }
    }
});