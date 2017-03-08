/*****************************************************************************/
/* EmployeePersonalDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePersonalDataModal.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeePersonalDataModal');
    },
    'click #save': (e, tmpl) => {
      let user = Template.instance().getEditUser();
      console.log("User to update on server: \n" + JSON.stringify(user));

      Meteor.call('account/updatePersonalData', user, user._id, (err, res) => {
          if (res){
              swal({
                  title: "Success",
                  text: `Employee Updated`,
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
        user.emails = user.emails || [];
        if(user.emails.length > 0) {
          user.emails.splice(0, 1).push({
            address: value,
            verified: false
          })
        } else {
          user.emails.push({
            address: value,
            verified: false
          })
        }
        console.log("user email changed to: " + JSON.stringify(user.emails));
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
    'change [name=maritalStatus]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.maritalStatus = value;
        console.log("user maritalStatus changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
});

/*****************************************************************************/
/* EmployeePersonalDataModal: Helpers */
/*****************************************************************************/
Template.EmployeePersonalDataModal.helpers({
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return selectedEmployee;
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
});

/*****************************************************************************/
/* EmployeePersonalDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePersonalDataModal.onCreated(function () {
    let self = this;
    // self.subscribe("allEmployees", Session.get('context'));
    // self.subscribe("getPositions", Session.get('context'));

    self.getEditUser = () => {
      return Session.get('employeePersonalData');
    }

    self.setEditUser = (editUser) => {
      console.log("Inside setEditUser");
      Session.set('employeePersonalData', editUser);
    }

    let selectedEmployee = Session.get('employeesList_selectedEmployee')
    delete selectedEmployee.employeeProfile.guarantor;
    delete selectedEmployee.employeeProfile.employment;
    delete selectedEmployee.employeeProfile.emergencyContact;
    delete selectedEmployee.employeeProfile.payment;

    self.setEditUser(selectedEmployee);
});

Template.EmployeePersonalDataModal.onRendered(function () {
});

Template.EmployeePersonalDataModal.onDestroyed(function () {
});
