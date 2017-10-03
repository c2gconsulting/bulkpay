/*****************************************************************************/
/* EmployeePersonalDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePersonalDataModal.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeePersonalDataModal');
    },
    'click #save': (e, tmpl) => {
      let user = Template.instance().getEditUser();

      // if ($('#uploadBtn')[0].files[0]) {
      //   user.employeeProfile.photo = UserImages.insert($('#uploadBtn')[0].files[0]);
      // }
      Meteor.call('account/updatePersonalData', user, user._id, (err, res) => {
          if (res){
              Session.set('employeesList_selectedEmployee', user);
              swal({
                  title: "Success",
                  text: `Employee personal details updated`,
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
              Modal.hide('EmployeePersonalDataModal');
          } else {
              console.log(err);
          }
      });
    },
    'click #sendEnrollmentEmail': function(e, tmpl) {
        let user = Template.instance().getEditUser();

        $('#sendEnrollmentEmail').text('Sending. Please wait ...')
        tmpl.$('#sendEnrollmentEmail').attr('disabled', true);

        Meteor.call('accounts/sendNewUserEmail', Session.get('context'), user._id, (err, res) => {
            $('#sendEnrollmentEmail').text('Send Enrollment Email')
            tmpl.$('#sendEnrollmentEmail').attr('disabled', false);

            if (res){
                swal({
                    title: "Success",
                    text: res,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                console.log(err);
                swal('Error', err.message, 'error')
            }
        });
    },
    'click #resetUsernameAndPassword': function(e, tmpl) {
        let user = Template.instance().getEditUser();

        $('#resetUsernameAndPassword').text('Sending. Please wait ...')
        tmpl.$('#resetUsernameAndPassword').attr('disabled', true);

        Meteor.call('accounts/resetToDefaultUsernameAndPassword', Session.get('context'), user._id, (err, res) => {
            $('#resetUsernameAndPassword').text('Reset Username and Password')
            tmpl.$('#resetUsernameAndPassword').attr('disabled', false);

            if (res){
              user.customUsername = res;
              tmpl.setEditUser(user);

              let selectedSessionUser = Session.get('employeesList_selectedEmployee')
              selectedSessionUser.customUsername = res
              Session.set('employeesList_selectedEmployee', selectedSessionUser)

              swal({
                  title: "Success",
                  text: "Username and Password were reset successfully",
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
            } else {
                console.log(err);
                swal('Error', err.message, 'error')
            }
        });
    },
    'change #uploadBtn': function(e){
        if (e.target.files && e.target.files[0]) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#profile-img')
                    .attr('src', e.target.result)
            };

            reader.readAsDataURL(e.target.files[0]);
            //upload = UserImages.insert(e.target.files[0]);
            //$('#filename').html(e.target.files[0].name);
        }
    },
    'blur [name=employeeId]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.employeeId = value;

        console.log("user employeeId changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=firstName]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.profile = user.profile || {};
        user.profile.firstname = value;
        user.profile.fullName = value + " " + user.profile.lastname + " " + (user.profile.othernames || "");

        console.log("user firstname changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=lastName]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.profile = user.profile || {};
        user.profile.lastname = value;
        user.profile.fullName = user.profile.firstname + " " + value + " " + (user.profile.othernames || "");

        console.log("user lastName changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=otherNames]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.profile = user.profile || {};
        user.profile.othernames = value;
        user.profile.fullName = user.profile.firstname + " " + user.profile.lastname + " " + value;

        console.log("user otherNames changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=address]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.address = value;
        console.log("user address changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=email]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        if(user.emails.length > 0) {
          let emailObj = user.emails[0];
          emailObj.address = value;
          emailObj.verified = value;
        } else {
          user.emails.push({
            name : value,
            verified : false
          });
        }
        console.log("user email changed to: " + JSON.stringify(user.emails));
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=personalEmail]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.personalEmailAddress = value;
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=dateOfBirth]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.dateOfBirth = value;
        console.log("user dateOfBirth changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'change [name=gender]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.gender = value;
        console.log("user gender changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=maritalStatus]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.maritalStatus = value;
        console.log("user maritalStatus changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=phone]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.phone = value;
        console.log("user maritalStatus changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=nationality]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.nationality = value;
        console.log("user nationality changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=state]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.state = value;
        console.log("user state changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=religion]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.religion = value;
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=bloodGroup]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.bloodGroup = value;
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=disability]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.disability = value;
      }
      Template.instance().setEditUser(user);
    },
});

/*****************************************************************************/
/* EmployeePersonalDataModal: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MM-DD-YYYY');
});

Template.EmployeePersonalDataModal.helpers({
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return [selectedEmployee];
    },
    positions: () => {
        return EntityObjects.find();
    },
    'states': () => {
        return Core.states();
    },
    'countries': () => {
        return Core.IsoCountries();
    },
    'defaultCountry': (ccode) => {
        return ccode === Core.country ? selected='selected' : "";
    },
    'defaultState': (code) => {
        return code === Core.states ? selected='selected' : "";
    },
    'selectedPosition': () => {
        return Template.instance().selectedPosition.get();
    },
    'grades': () => {
        return PayGrades.find();
    },
    hasEmployeeAccess: () => {
      let canManageEmployeeData = Core.hasEmployeeAccess(Meteor.userId())
      return canManageEmployeeData;
    }
});

/*****************************************************************************/
/* EmployeePersonalDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePersonalDataModal.onCreated(function () {
    let self = this;

    self.getEditUser = () => {
      return Session.get('employeePersonalData');
    }

    self.setEditUser = (editUser) => {
      Session.set('employeePersonalData', editUser);
    }

    let selectedEmployee = Session.get('employeesList_selectedEmployee')
    if(!selectedEmployee.emails) {
      selectedEmployee.emails = [];
    }
    self.setEditUser(selectedEmployee);
});

Template.EmployeePersonalDataModal.onRendered(function () {
  let selectedEmployee = Session.get('employeesList_selectedEmployee');

  $('[name="gender"]').val(selectedEmployee.employeeProfile.gender);
  $('[name="maritalStatus"]').val(selectedEmployee.employeeProfile.maritalStatus);
  $('[name="nationality"]').val(selectedEmployee.employeeProfile.nationality);
  $('[name="state"]').val(selectedEmployee.employeeProfile.state);

  $('[name="religion"]').val(selectedEmployee.employeeProfile.religion);
  $('[name="bloodGroup"]').val(selectedEmployee.employeeProfile.bloodGroup);
  $('[name="disability"]').val(selectedEmployee.employeeProfile.disability);
});

Template.EmployeePersonalDataModal.onDestroyed(function () {
});
