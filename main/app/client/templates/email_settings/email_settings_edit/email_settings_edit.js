/*****************************************************************************/
/* HotelCreate: Event Handlers */
/*****************************************************************************/
Template.EmailSettingEdit.events({
    'click #new-emailsetting-close': (e, tmpl) => {
      Modal.hide('EmailSettingEdit');
    },
    'click #save': (e, tmpl) => {
 
      let emailsettingName = $('[name=emailsetting-name]').val();
      let emailsettingEmail = $('[name=emailsetting-email]').val();
      let emailsettingDepartment= $('[name=emailsetting-department]').val();
      const emails = emailsettingEmail.split(',')
      const isValidEmails = emails.every(email => validateEmail(email.trim()))

     if(!emailsettingName || emailsettingName.trim().length === 0) {
          Template.instance().errorMessage.set("Please enter the EmailSetting name");
      } else if (!isValidEmails) {
        Template.instance().errorMessage.set("Please enter the EmailSetting emails seperated by comma");
      } else {
        Template.instance().errorMessage.set(null);

        const emailsetting = Template.instance().emailsetting.get()

        let newEmailSetting = {
          ...emailsetting,
          businessId: Session.get('context'),
   
          name : emailsettingName,
          email :  emailsettingEmail,
          department : emailsettingDepartment
          
        };

   
        const { _id } = emailsetting;
        Meteor.call('emailsetting/update', _id, newEmailSetting, (err, res) => {
            if (res){
                swal({
                    title: "Success",
                    text: `Email Setting Editted`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
                Modal.hide('EmailSettingEdit');
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
  Template.EmailSettingEdit.helpers({

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
    'emailsetting': function() {
      return Template.instance().emailsetting.get()
    },
    'errorMessage': function() {
      return Template.instance().errorMessage.get()
    }
  });

  /*****************************************************************************/
  /* HotelCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.EmailSettingEdit.onCreated(function () {
    let self = this;
    let businessUnitId = Session.get('context');


    self.emailsetting = new ReactiveVar()
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)


    let invokeReason = self.data;

    self.autorun(function(){

      console.log('emailSettingDetails 222', invokeReason)
      if (invokeReason){
        let emailSettingsSub = self.subscribe('emailsetting', invokeReason.requisitionId);

        // console.log('emailSettingDetails 333', emailSettingsSub.ready())
        if(emailSettingsSub.ready()) {
          let emailSettingDetails = EmailSettings.findOne({_id: invokeReason.requisitionId});

          console.log('emailSettingDetails 444', emailSettingDetails)

          /* End of Pre-selection */
            self.emailsetting.set(emailSettingDetails)
        }
      }
    })
  });

  Template.EmailSettingEdit.onRendered(function () {
  });

  Template.EmailSettingEdit.onDestroyed(function () {
  });

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }