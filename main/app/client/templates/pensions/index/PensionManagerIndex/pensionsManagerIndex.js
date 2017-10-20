/*****************************************************************************/
/* PensionsIndex: Event Handlers */
/*****************************************************************************/
Template.PensionManagerIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('PensionManagerCreate');
    }
});

/*****************************************************************************/
/* Pensions: Helpers */
/*****************************************************************************/
Template.PensionManagerIndex.helpers({
    'pfas': function(){
      let allPfas = PensionManagers.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return PensionManagers.find().count();
    }

});

/*****************************************************************************/
/* Pensions: Lifecycle Hooks */
/*****************************************************************************/
Template.PensionManagerIndex.onCreated(function () {
    let self = this;
    self.subscribe("pensionManagers", Session.get('context'));
});

Template.PensionManagerIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.PensionManagerIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singlePensionFundAdministrator: Helpers */
/*****************************************************************************/
Template.singlePensionFundAdministrator.events({
    'click #deletePensionManager': function(e, tmpl) {
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
            const pensionManagerId = self.data._id;
            const code = self.data.code;

            Meteor.call('pensionManager/delete', pensionManagerId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Pension Manager: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
