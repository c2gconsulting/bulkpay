/*****************************************************************************/
/* EmployeeEmploymentDetailsDataEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeEmploymentDetailsDataEntry.events({
  'click #save-close': (e, tmpl) => {
    Modal.hide('EmployeeEditEmploymentPayrollModal');
  },
  'click #save': (e, tmpl) => {
    let user = Template.instance().getEditUser();
    console.log("User to update on server: \n" + JSON.stringify(user));

    Meteor.call('account/updateEmploymentData', user, user._id, (err, res) => {
        if (res){
            Session.set('employeesList_selectedEmployee', user);
            swal({
                title: "Success",
                text: `Employee employment data updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('EmployeeEditEmploymentPayrollModal');
        } else {
            console.log(err);
        }
    });
  },
  'blur [name=employmentPosition]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.position = value;

      console.log("user employment position changed to: " + value);
      //Template.instance().setSelectedPosition(value);

      var parentTmplInstance = this.view.parentView.templateInstance();
      let selectedPosition = parentTmplInstance.selectedPosition;
      selectedPosition.set(value);
    }
    Template.instance().setEditUser(user);
    Template.instance().setSelectedPosition(value);
  },
  'blur [name=employmentPayGrade]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.paygrade = value;

      console.log("user employment paygrade changed to: " + value);
      var parentTmplInstance = this.view.parentView.templateInstance();
      let selectedGrade = parentTmplInstance.selectedGrade;
      selectedGrade.set(value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentHireDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.hireDate = value;

      console.log("user employment hireDate changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentConfirmationDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.confirmationDate = value;

      console.log("user employment confirmationDate changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentStatus]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.status = value;

      console.log("user employment status changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentTerminationDate]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.terminationDate = value;

      console.log("user employment terminationDate changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'change [name=employmentPayGrade]': function(e, tmpl) {
      let user = Template.instance().getEditUser();
      let value = e.currentTarget.value;
      if (value && value.trim().length > 0) {
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.employment = user.employeeProfile.employment || {};
        user.employeeProfile.employment.paygrade = value;

        console.log("user employment paygrade changed to: " + value);
        Template.instance().setSelectedPayGrade(value);
      }
      Template.instance().setEditUser(user);
  }
});

/*****************************************************************************/
/* EmployeeEmploymentDetailsDataEntry: Helpers */
/*****************************************************************************/
Template.registerHelper('formatDate', function(date) {
  return moment(date).format('MM-DD-YYYY');
});

Template.EmployeeEmploymentDetailsDataEntry.helpers({
    'employees': function(){
        return Meteor.users.find({"employee": true});
    },
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return [selectedEmployee];
    },
    positions: () => {
        return EntityObjects.find();
    },
    'selectedPosition': () => {
      var parentTmplInstance = this.view.parentView.templateInstance();
      let selectedPosition = parentTmplInstance.selectedPosition;
      return selectedPosition.get();
    },
    'grades': () => {
        return PayGrades.find();
    },
});

/*****************************************************************************/
/* EmployeeEmploymentDetailsDataEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeEmploymentDetailsDataEntry.onCreated(function () {
  let self = this;

  self.getEditUser = () => {
    return Session.get('employeeEmploymentDetailsData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeEmploymentDetailsData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  self.setEditUser(selectedEmployee);

  self.autorun(function(){
      let selectedEmployee = self.getEditUser();
      if(selectedEmployee) {
          Session.set("selectedEmployee_employmentDetails_selectedPayGrade",
          selectedEmployee.employeeProfile.employment.paygrade);
      }
      let position = Session.get("selectedEmployee_employmentDetails_selectedPosition");
      if(position)
          self.subscribe("assignedGrades", position);
  });
});

Template.EmployeeEmploymentDetailsDataEntry.onRendered(function () {
  let selectedEmployee = Session.get('employeesList_selectedEmployee');
  console.log("Positon: " + selectedEmployee.employeeProfile.employment.position);

  $('[name="employmentPosition"]').val(selectedEmployee.employeeProfile.employment.position);
  $('[name="employmentStatus"]').val(selectedEmployee.employeeProfile.employment.status);
});

Template.EmployeeEmploymentDetailsDataEntry.onDestroyed(function () {
});

//----
