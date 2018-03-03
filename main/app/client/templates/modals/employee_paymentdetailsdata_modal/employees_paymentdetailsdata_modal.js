/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Event Handlers */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.events({
  'click #save-close': (e, tmpl) => {
    Modal.hide('EmployeePaymentDetailsDataModal');
  },
  'click #save': (e, tmpl) => {
    let user = Template.instance().getEditUser();

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
    }
    Template.instance().setEditUser(user);
  },
  'blur [name=paymentDetailsTaxPayerId]': function (e, tmpl) {
    let user = Template.instance().getEditUser();
    let value = e.currentTarget.value;
    if (value && value.trim().length > 0) {
      user.employeeProfile = user.employeeProfile || {};
      user.employeeProfile.payment = user.employeeProfile.payment || {};
      user.employeeProfile.payment.taxPayerId = value;
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
    },
    'pfas': function(){
      let allPfas = PensionManagers.find({});
      return allPfas;
    },
    // banks: function() {
    //   return Core.banks();
    //   // return Banks.find()
    // }
});

/*****************************************************************************/
/* EmployeePaymentDetailsDataModal: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeePaymentDetailsDataModal.onCreated(function () {
  let self = this;

  self.subscribe("pensionManagers", Session.get('context'));

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

Template.EmployeePaymentDetailsDataModal.onRendered(function () {
  let selectedEmployee = Session.get('employeesList_selectedEmployee')

  $('[name="paymentMethod"]').val(selectedEmployee.employeeProfile.payment.paymentMethod);
  $('[name="bank"]').val(selectedEmployee.employeeProfile.payment.bank);
  $('[name="pensionmanager"]').val(selectedEmployee.employeeProfile.payment.pensionmanager);
});

Template.EmployeePaymentDetailsDataModal.onDestroyed(function () {
});
