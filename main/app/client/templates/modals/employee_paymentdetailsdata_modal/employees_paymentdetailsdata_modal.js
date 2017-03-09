/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.events({
  'click #save-close': (e, tmpl) => {
    Modal.hide('EmployeePaymentDetailsDataModal');
  },
  'click #save': (e, tmpl) => {
    let user = Template.instance().getEditUser();
    console.log("User to update on server: \n" + JSON.stringify(user));

    Meteor.call('account/updatePaymentData', user, user._id, (err, res) => {
        if (res){
            Session.set('employeesList_selectedEmployee', user);
            swal({
                title: "Success",
                text: `Employee payment details updated`,
                confirmButtonClass: "btn-success",
                type: "success",
                confirmButtonText: "OK"
            });
            Modal.hide('EmployeePaymentDetailsDataModal');
        } else {
            console.log(err);
        }
    });
  },
  'blur [name=paymentMethod]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.paymentMethod = value;

      console.log("user payment paymentMethod changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=bank]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.bank = value;

      console.log("user payment bank changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=paymentDetailsAccountNumber]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.accountNumber = value;

      console.log("user payment accountNumber changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=paymentDetailsAccountName]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.accountName = value;

      console.log("user payment accountName changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=pensionmanager]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.pensionmanager = value;

      console.log("user payment pensionmanager changed to: " + value);
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=paymentDetailsRSAPin]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.RSAPin = value;

      console.log("user payment RSAPin changed to: " + value);
    }
    Template.instance().setEditUser(user);
  }
});

/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Helpers */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.helpers({
    "selectedEmployee": function() {
        let selectedEmployee = Session.get('employeesList_selectedEmployee');
        return [selectedEmployee];
    }
});

/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.onCreated(function () {
  let self = this;

  self.getEditUser = () => {
    return Session.get('employeeNextOfKinData');
  }

  self.setEditUser = (editUser) => {
    console.log("Inside setEditUser");
    Session.set('employeeNextOfKinData', editUser);
  }

  let selectedEmployee = Session.get('employeesList_selectedEmployee')
  delete selectedEmployee.employeeProfile.guarantor;
  delete selectedEmployee.employeeProfile.employment;
  delete selectedEmployee.employeeProfile.emergencyContact;
  //delete selectedEmployee.employeeProfile.payment;

  self.setEditUser(selectedEmployee);
});

Template.EmployeePaymentDetailsDataModal.onRendered(function () {
});

Template.EmployeePaymentDetailsDataModal.onDestroyed(function () {
});
