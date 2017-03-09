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

      console.log("user employment position changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=employmentPayGrade]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.employment = user.employeeProfile.employment || {};
      user.employeeProfile.employment.paygrade = value;

      console.log("user employment paygrade changed to: " + value);
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
        let editUser = Template.instance().getEditUser();
        if(editUser) {
          return editUser.employeeProfile.employment.position;
        } else {
          return null;
        }
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
    return Session.get('employeeNextOfKinData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeNextOfKinData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  self.setEditUser(selectedEmployee);

  // var self = this;
  //
  // self.selectedPosition = new ReactiveVar();
  // self.selectedGrade = new ReactiveVar();
  // self.assignedTypes = new ReactiveVar();
  // // self.subscribe("getPositions", Session.get('context'));
  self.subscribe("getbuconstants", selectedEmployee._id);
  //
  self.autorun(function(){
      // let position = self.getSelectedPosition();
      let position = Session.get("selectedEmployee_employmentDetails_selectedPosition");
      if(position)
          self.subscribe("assignedGrades", position);
  });

  self.getSelectedPosition = () => {
    return Session.get("selectedEmployee_employmentDetails_selectedPosition");
  }

  self.setSelectedPosition = (selectedPosition) => {
    Session.set("selectedEmployee_employmentDetails_selectedPosition", selectedPosition);
  }
  //--
  self.getSelectedPayGrade = () => {
    return Session.get("selectedEmployee_employmentDetails_selectedPayGrade");
  }

  self.setSelectedPayGrade = (selectedPayGrade) => {
    Session.set("selectedEmployee_employmentDetails_selectedPayGrade", selectedPayGrade);
  }
  //--
  self.getAssignedPayTypes = () => {
    return Session.get("selectedEmployee_employmentDetails_assignedPayTypes");
  }

  self.setAssignedPayTypes = (selectedPosition) => {
    Session.set("selectedEmployee_employmentDetails_assignedPayTypes", selectedPosition);
  }


  self.autorun(function(){
      let selectedGrade = Template.instance().getSelectedPayGrade();
      if(selectedGrade){
          let grade = PayGrades.findOne({_id: selectedGrade});
          if (grade){
              let paytypes = grade.payTypes.map(x => {
                  return x.paytype;
              });
              self.subscribe("getpositionGrades", paytypes);
          }
          //
          let pgObj = PayGrades.findOne({_id: selectedGrade});
          let paytypes = pgObj.payTypes;
          paytypes.forEach(x => {
              pt = PayTypes.findOne({_id: x.paytype});
              if (pt)
                  _.extend(x, pt);
              return x
          });
          Template.instance().setAssignedPayTypes(paytypes);
      }
  });
});

Template.EmployeeEmploymentDetailsDataEntry.onRendered(function () {
});

Template.EmployeeEmploymentDetailsDataEntry.onDestroyed(function () {
});

//----
