/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.events({
  'click #save-close': (e, tmpl) => {
    Modal.hide('EmployeeEmergencyContactDataModal');
  },
  'click #save': (e, tmpl) => {
    let user = Template.instance().getEditUser();
    console.log("User to update on server: \n" + JSON.stringify(user));

    Meteor.call('account/updateEmergencyContactData', user, user._id, (err, res) => {
        if (res){
            Session.set('employeesList_selectedEmployee', user);
            swal({
                title: "Success",
                text: `Employee emergency contact data updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('EmployeeEmergencyContactDataModal');
            const logObject = {
                event: 'update-profile',
                user: { email: user.emails[0].address },
                collectionName: 'users',
                oldData: {},
                newData: {...user}
            };
            Meteor.call('logs/createLog', logObject, function(err){
                if(err){
                    console.log('error while logging data', err);
                }
            });
        } else {
            console.log(err);
        }
    });
  },
  'blur [name=emergencyContactFullName]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.name = value;
      } else {
        user.employeeProfile.emergencyContact.push({
          name : value
        });
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
  'blur [name=emergencyContactEmail]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.email = value;
      } else {
        user.employeeProfile.emergencyContact.push({
          email : value
        });
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
  'blur [name=emergencyContactPhone]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.phone = value;
      } else {
        user.employeeProfile.emergencyContact.push({
          phone : value
        });
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
  'blur [name=emergencyContactAddress]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.address = value;
      } else {
        user.employeeProfile.emergencyContact.push({
          address : value
        });
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
  'blur [name=emergencyContactCity]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.city = value;
      } else {
        user.employeeProfile.emergencyContact.push({
          city : value
        });
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
  'blur [name=emergencyContactState]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      if(user.employeeProfile.emergencyContact.length > 0) {
        user.employeeProfile.emergencyContact.push({
          state : value
        });
      } else {
        let emergencyContactObj = user.employeeProfile.emergencyContact[0];
        emergencyContactObj.state = value;
      }
    }
    console.log("user emergency contact: " + JSON.stringify(user.employeeProfile.emergencyContact[0]));
    Template.instance().setEditUser(user);
  },
});

/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Helpers */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.helpers({
  "selectedEmployee": function() {
      let selectedEmployee = Session.get('employeesList_selectedEmployee');
      return [selectedEmployee];
  },
  'states': () => {
    let statesList = Core.states();
    console.log("States list: " + JSON.stringify(statesList));
    return statesList;
  }
});

/*****************************************************************************/
/* EmployeeEmergencyContactDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEmergencyContactDataModal.onCreated(function () {
  let self = this;

  self.getEditUser = () => {
    return Session.get('employeeNextOfKinData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeNextOfKinData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee');
  if(selectedEmployee.employeeProfile) {
    if(!selectedEmployee.employeeProfile.emergencyContact) {
      selectedEmployee.employeeProfile.emergencyContact = [];
    }
  } else {
    selectedEmployee.employeeProfile = {};
    selectedEmployee.employeeProfile.emergencyContact = [];
  }
  self.setEditUser(selectedEmployee);
});

Template.EmployeeEmergencyContactDataModal.onRendered(function () {
});

Template.EmployeeEmergencyContactDataModal.onDestroyed(function () {
});
