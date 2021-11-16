/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.events({
    'click #save-close': (e, tmpl) => {
      Modal.hide('EmployeeNextOfKinDataModal');
    },
    'click #save': (e, tmpl) => {
      let user = Template.instance().getEditUser();
      console.log("User to update on server: \n" + JSON.stringify(user));

      Meteor.call('account/updateNextOfKinData', user, user._id, (err, res) => {
          if (res){
              Session.set('employeesList_selectedEmployee', user);
              swal({
                  title: "Success",
                  text: `Employee next of kin data updated`,
                  confirmButtonClass: "btn-success",
                  type: "success",
                  confirmButtonText: "OK"
              });
              Modal.hide('EmployeeNextOfKinDataModal');
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
    'blur [name=guarantorFullName]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.fullName = value;

        console.log("user guarantor fullName changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=guarantorEmail]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.email = value;

        console.log("user guarantor email changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=guarantorPhone]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.phone = value;

        console.log("user guarantor phone changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=guarantorAddress]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.address = value;

        console.log("user guarantor address changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'blur [name=guarantorCity]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.city = value;

        console.log("user guarantor city changed to: " + value);
      }
      Template.instance().setEditUser(user);
    },
    'change [name=guarantorState]': function (e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor.state = value;

        console.log("user guarantor state changed to: " + value);
      }
      Template.instance().setEditUser(user);
    }
});

/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Helpers */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.helpers({
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return [selectedEmployee];
    },
    'states': () => {
        return Core.states();
    }
});

/*****************************************************************************/
/* EmployeeNextOfKinDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeNextOfKinDataModal.onCreated(function () {
  let self = this;

  self.getEditUser = () => {
    return Session.get('employeeNextOfKinData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeNextOfKinData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  self.setEditUser(selectedEmployee);
});

Template.EmployeeNextOfKinDataModal.onRendered(function () {
  let selectedEmployee = Session.get('employeesList_selectedEmployee');
  console.log("next of kin state: " + selectedEmployee.employeeProfile.guarantor.state);

  $('[name="guarantorState"]').val(selectedEmployee.employeeProfile.guarantor.state);
});

Template.EmployeeNextOfKinDataModal.onDestroyed(function () {
});
