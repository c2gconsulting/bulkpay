/*****************************************************************************/
/* HotelIndex: Event Handlers */
/*****************************************************************************/
Template.EmailSettingIndex.events({
    'click #newPFA': (e,tmpl) => {
        e.preventDefault();
        Modal.show('EmailSettingCreate');
    }
});

/*****************************************************************************/
/* Hotels: Helpers */
/***************************************************************************/
Template.EmailSettingIndex.helpers({
    'pfas': function(){
      let allPfas = EmailSettings.find({});
      return allPfas;
    },
    'pfaCount': function(){
        return EmailSettings.find().count();
    }

});

/*****************************************************************************/
/* Hotels: Lifecycle Hooks */
/*****************************************************************************/
Template.EmailSettingIndex.onCreated(function () {
    let self = this;
    self.subscribe("emailsettings", Session.get('context'));
});

Template.EmailSettingIndex.onRendered(function () {
    //UI.insert( UI.render( Template.PensionManagerIndex ), $('#pensionContext').get(0) );
});

Template.EmailSettingIndex.onDestroyed(function () {
});


/*****************************************************************************/
/* singleHotel: Helpers */
/*****************************************************************************/
Template.singleEmailSetting.events({
    'click #deleteEmailSetting': function(e, tmpl) {
        event.preventDefault();
        let self = this;

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this Email Setting",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, () => {
            const emailsettingId = self.data._id;
            const code = self.data.code;

            Meteor.call('emailsetting/delete', emailsettingId, (err, res) => {
                if(!err){
                    Modal.hide();
                    swal("Deleted!", `Email Setting: ${code} has been deleted.`, "success");
                }
            });
        });
    }
})
