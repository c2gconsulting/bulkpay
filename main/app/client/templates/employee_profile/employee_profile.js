/*****************************************************************************/
/* EmployeeProfile: Event Handlers */
/*****************************************************************************/

Template.EmployeeProfile.events({
    'click #editPersonalInfo': (e, tmpl) => {
        e.preventDefault()
        Template.instance().personalInfoInEditMode.set(true)
    },
    'click #savePersonalInfo': (e, tmpl) => {
        e.preventDefault()
        let user = Template.instance().currentEmployee.get()

        const numberOfChildren = tmpl.$('[name=numberOfChildren]').val()
        const phone = tmpl.$('[name=personalPhone]').val()
        const address = tmpl.$('[name=personalAddress]').val()
        const religion = tmpl.$('[name=religion]').val()
        const bloodGroup = tmpl.$('[name=bloodGroup]').val()
        const disability = tmpl.$('[name=disability]').val()
        const workExperiences = tmpl.$('[name=workExperiences]').val()
        
        user.employeeProfile = user.employeeProfile || {};
        user.employeeProfile = {
            numberOfChildren: numberOfChildren,
            phone: phone,
            address: address,
            religion : religion,
            bloodGroup: bloodGroup,
            disability: disability,
            workExperiences: workExperiences
        }

        Meteor.call('account/updatePersonalData', user, user._id, (err, res) => {
            if (res) {
                tmpl.nextOfKinInEditMode.set(false)
                Session.set('employeesList_selectedEmployee', user);
                swal({
                    title: "Success",
                    text: `Personal details updated`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            }
        });
    },
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
    }
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
    "personalInfoInEditMode": () => {
      return Template.instance().personalInfoInEditMode.get();
    },
    "nextOfKinInEditMode": () => {
      return Template.instance().nextOfKinInEditMode.get();
    },
    "beneficiaryInEditMode": () => {
      return Template.instance().beneficiaryInEditMode.get();
    },
    "disablePersonalInfoFields": () => {
      return Template.instance().personalInfoInEditMode.get() ? '' : 'disabled'
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

    self.personalInfoInEditMode = new ReactiveVar()
    self.nextOfKinInEditMode = new ReactiveVar()
    self.beneficiaryInEditMode = new ReactiveVar()
});

Template.EmployeeProfile.onRendered(function () {
    let user = Template.instance().currentEmployee.get()

    $('[name=religion]').val(user.employeeProfile.religion)
    $('[name=bloodGroup]').val(user.employeeProfile.bloodGroup)
    $('[name=disability]').val(user.employeeProfile.disability)
});

Template.EmployeeProfile.onDestroyed(function () {
});
