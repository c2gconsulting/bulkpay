/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.AirlineIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('AirlineCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/***************************************************************************/
Template.AirlineIndex.helpers({
    'pfas': function(){
      let allPfas = Airlines.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return Airlines.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.AirlineIndex.onCreated(function () {
    let self = this;
    self.subscribe("airlines", Session.get('context'));
});

Template.AirlineIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.AirlineIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleAirline.events({
    'click .pointer': function (e,tmpl) {
        e.preventDefault();
        Modal.show('AirlineCreate', this.data);
    },
    'click #deleteAirline': function(e, tmpl) {
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
            const airlineId = self.data._id;
            const code = self.data.code;

            Meteor.call('airline/delete', airlineId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
