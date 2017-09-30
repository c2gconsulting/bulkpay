/*****************************************************************************/
/* EmployeeProfile: Event Handlers */
/*****************************************************************************/

Template.EmployeeProfile.events({
    'click #editNextOfKin': (e, tmpl) => {
        e.preventDefault()
        Template.instance().nextOfKinInEditMode.set(true)
    },
    'click #saveNextOfKin': (e, tmpl) => {
        e.preventDefault()
        let user = Template.instance().currentEmployee.get()

        const fullName = tmpl.$('[name=nextOfKinFullName]').val()
        const email = tmpl.$('[name=nextOfKinEmail]').val()
        const phone = tmpl.$('[name=nextOfKinPhone]').val()
        const address = tmpl.$('[name=nextOfKinAddress]').val()
        const city = tmpl.$('[name=nextOfKinCity]').val()
        const state = tmpl.$('[name=nextOfKinState]').val()

        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.guarantor = user.employeeProfile.guarantor || {};
        user.employeeProfile.guarantor = {
            fullName: fullName,
            email: email,
            phone : phone,
            address: address,
            city : city,
            state : state
        }

        Meteor.call('account/updateNextOfKinData', user, user._id, (err, res) => {
            if (res) {
                tmpl.nextOfKinInEditMode.set(false)
                Session.set('employeesList_selectedEmployee', user);
                swal({
                    title: "Success",
                    text: `Next of kin details updated`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            }
        });
    },
    'click #editBeneficiary': (e, tmpl) => {
        e.preventDefault()
        
        Template.instance().beneficiaryInEditMode.set(true)
    },
    'click #saveBeneficiary': (e, tmpl) => {
        e.preventDefault()
        let user = Template.instance().currentEmployee.get()

        const fullName = tmpl.$('[name=beneficiaryFullName]').val()
        const email = tmpl.$('[name=beneficiaryEmail]').val()
        const phone = tmpl.$('[name=beneficiaryPhone]').val()
        const address = tmpl.$('[name=beneficiaryAddress]').val()
        const city = tmpl.$('[name=beneficiaryCity]').val()
        const state = tmpl.$('[name=beneficiaryState]').val()

        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile.beneficiary = user.employeeProfile.beneficiary || {};
        user.employeeProfile.beneficiary = {
            fullName: fullName,
            email: email,
            phone : phone,
            address: address,
            city : city,
            state : state
        }

        Meteor.call('account/updateBeneficiaryData', user, user._id, (err, res) => {
            if (res) {
                tmpl.beneficiaryInEditMode.set(false)
                Session.set('employeesList_selectedEmployee', user);
                swal({
                    title: "Success",
                    text: `Beneficiary details updated`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            }
        });
    },
});

/*****************************************************************************/
/* EmployeeProfile: Helpers */
/*****************************************************************************/

Template.registerHelper('formatDate', function(date) {
  return moment(date).format('DD-MM-YYYY');
});

Template.EmployeeProfile.helpers({
    "currentEmployee": () => {
      return [Template.instance().currentEmployee.get()];
    },
    "images": (id) => {
        return UserImages.findOne({_id: id});
    },
    "nextOfKinInEditMode": () => {
      return Template.instance().nextOfKinInEditMode.get();
    },
    "beneficiaryInEditMode": () => {
      return Template.instance().beneficiaryInEditMode.get();
    },
    "disableNextOfKinFields": () => {
      return Template.instance().nextOfKinInEditMode.get() ? '' : 'disabled'
    },
    "disableBeneficiaryFields": () => {
      return Template.instance().beneficiaryInEditMode.get() ? '' : 'disabled'
    },
    positionName: (id)=> {
        if(id) {
          let position = EntityObjects.findOne({_id: id});
          return position.name;
        } else {
          return "";
        }
    },
    supervisorName: (positionId) => {
        if(positionId) {
            let position = EntityObjects.findOne({_id: positionId});

            if(position.properties && position.properties.supervisor) {
                let supervisorId = position.properties.supervisor
                let supervisorPosition = EntityObjects.findOne({_id: supervisorId});
                if(supervisorPosition) {
                   return supervisorPosition.name
                }
            }
            return "";
        } else {
            return "";
        }
    }
});

/*****************************************************************************/
/* EmployeeProfile: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeProfile.onCreated(function () {
    let self = this;
    self.subscribe('getPositions', Session.get('context'))

    self.currentEmployee = new ReactiveVar();
    self.currentEmployee.set(Meteor.users.findOne({_id: Meteor.userId()}));

    self.nextOfKinInEditMode = new ReactiveVar()
    self.beneficiaryInEditMode = new ReactiveVar()
});

Template.EmployeeProfile.onRendered(function () {
});

Template.EmployeeProfile.onDestroyed(function () {
});
