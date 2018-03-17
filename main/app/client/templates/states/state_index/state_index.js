/*****************************************************************************/
/* HotelIndex: Event Handlers */
/**************************************************************************/
Template.StateIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('StateCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/*****************************************************************************/
Template.StateIndex.helpers({
    'pfas': function(){
      let allPfas = States.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return States.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.StateIndex.onCreated(function () {
    let self = this;
    self.subscribe("states", Session.get('context'));
});

Template.StateIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.StateIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleState.events({
    'click #deleteState': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this State",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const stateId = self.data._id;
            const code = self.data.code;

            Meteor.call('state/delete', stateId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `State: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
