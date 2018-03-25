/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.EmailSettingCreate.events({
    'click #new-emailsetting-close': (e, tmpl) => {
      Modal.hide('EmailSettingCreate');
    },
    'click #save': (e, tmpl) => {
 
      let emailsettingName = $('[name=emailsetting-name]').val();
      let emailsettingEmail = $('[name=emailsetting-email]').val();
      let emailsettingDepartment= $('[name=emailsetting-department]').val();
      

     

     if(!emailsettingName || emailsettingName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the EmailSetting name");
      }
      else {
        Template.instance().errorMessage.set(null);

        let newEmailSetting = {
          businessId: Session.get('context'),
   
          name : emailsettingName,
          email :  emailsettingEmail,
          department : emailsettingDepartment
          
        };

   

        Meteor.call('emailsetting/create', newEmailSetting, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `New Email Setting added`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('EmailSettingCreate');
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
  Template.EmailSettingCreate.helpers({

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
  Template.EmailSettingCreate.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');

    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)


  });

  Template.EmailSettingCreate.onRendered(function () {
  });

  Template.EmailSettingCreate.onDestroyed(function () {
  });
