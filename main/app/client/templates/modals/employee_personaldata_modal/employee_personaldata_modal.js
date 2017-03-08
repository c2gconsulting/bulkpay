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

      Meteor.call('account/update', user, user._id, (err, res) => {
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
        user.firstname = value;
        console.log("user firstname changed to: " + value);
      }
      Template.instance().setEditUser(user);
    }
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

    self.setEditUser(Session.get('employeesList_selectedEmployee'));
});

Template.EmployeePersonalDataModal.onRendered(function () {
});

Template.EmployeePersonalDataModal.onDestroyed(function () {
});
