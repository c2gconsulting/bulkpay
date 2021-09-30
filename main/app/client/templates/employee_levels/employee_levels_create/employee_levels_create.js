/*****************************************************************************/
/* EmployeeLevelsCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda'
Template.EmployeeLevelsCreate.events({
  'click #new-hotel-close': (e, tmpl) => {
    Modal.hide('EmployeeLevelsCreate');
  },
  'click #deleteLevel': function(e, tmpl) {
    event.preventDefault();
    let self = this;

    swal({
      title: "Are you sure?",
      text: "You will not be able to recover this Employee Level",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    }, () => {
      const levelId = self._id;
      const code = self.name;

      Meteor.call('employeeLevels/delete', levelId, (err, res) => {
        if(!err){
          Modal.hide();
          swal("Deleted!", `Employee Level: ${code} has been deleted.`, "success");
        }
      });
    });
  },
  'click #save': (e, tmpl) => {
    let employeeLevels = tmpl.employeeLevels.get();
    const name = $("#grade-name").val()
    const label = $("#grade-label").val()
    const code = $("#grade-code").val()
    employeeLevels = {
      ...employeeLevels,
      createdAt: new Date(),
      name,
      code,
      label,
    }
    console.log('employeeLevels', employeeLevels)

    Template.instance().errorMessage.set(null);

    let employeeLevelsContext = Core.Schemas.EmployeesLevels.namedContext("employeeLevelsForm");
    employeeLevelsContext.validate(employeeLevels);
    if (employeeLevelsContext.isValid()) {
      console.log('Employee Level is Valid!');
    } else {
      console.log('Employee Level is not Valid!');
    }
    console.log(employeeLevelsContext._invalidKeys);

    e.preventDefault();
    let l = Ladda.create(tmpl.$('#save')[0]);
    l.start();

    Meteor.call('employeeLevels/create', employeeLevels, (err, res) => {
      l.stop();
      if (res){
        swal({
          title: "Success",
          text: `New Level added`,
          confirmButtonClass: "btn-success",
          type: "success",
          confirmButtonText: "OK"
        });
        Modal.hide('EmployeeLevelsCreate');
      } else {
        console.log(err);
        swal("Save Failed", "Unable to Save Level", "error");
      }
    });
  },
  'click #update': (e, tmpl) => {
    let employeeLevels = tmpl.employeeLevels.get();
    const name = $("#grade-name").val()
    const label = $("#grade-label").val()
    const code = $("#grade-code").val()
    employeeLevels = {
      ...employeeLevels,
      name,
      code,
      label,
    }
    console.log('employeeLevels:' + employeeLevels);

    Template.instance().errorMessage.set(null);

    e.preventDefault();
    let l = Ladda.create(tmpl.$('#update')[0]);
    l.start();

    let employeeLevelsContext = Core.Schemas.EmployeesLevels.namedContext("employeeLevelsForm");
    employeeLevelsContext.validate(employeeLevels);
    if (employeeLevelsContext.isValid()) {
      console.log('Employee Level is Valid!');
    } else {
      console.log('Employee Level is not Valid!');
    }
    console.log(employeeLevelsContext._invalidKeys);

    Meteor.call('employeeLevels/update', tmpl.data._id, employeeLevels, (err, res) => {
      l.stop();
        if (res){
          swal({
            title: "Success",
            text: `Employee Level Updated`,
            confirmButtonClass: "btn-success",
            type: "success",
            confirmButtonText: "OK"
          });
          Modal.hide('EmployeeLevelsCreate');
        } else {
          console.log(err);
          swal("Update Failed", "Cannot Update Employee Level", "error");
        }
    });
  }
});

/*****************************************************************************/
/* EmployeeLevelsCreate: Helpers */
/*****************************************************************************/
Template.EmployeeLevelsCreate.helpers({
  travelcityList() {
    return  Travelcities.find();
  },
  'employees': () => {
    return Meteor.users.find({employee: true});
  },
  'edit': () => {
  return Template.instance().data ? true:false;
  //use ReactiveVar or reactivedict instead of sessions..
  },
  'hotel': () => {
    return Template.instance().data.name;
  },
  employeeLevels(){
    return Template.instance().employeeLevels.get();
  },
  'checked': (prop) => {
    const employeeLevels = Template.instance().employeeLevels.get();
    if(employeeLevels) return employeeLevels[prop];
    return false;
  },
  selected(context,val) {
    let self = this;

    if(Template.instance().data){
      //get value of the option element
      //check and return selected if the template instce of data.context == self._id matches
      if(val){
          return Template.instance().data[context] === val ? selected="selected" : '';
      }
      return Template.instance().data[context] === self._id ? selected="selected" : '';
    }
  },
  'errorMessage': function() {
    return Template.instance().errorMessage.get()
  }
});

  /*****************************************************************************/
  /* EmployeeLevelsCreate: Lifecycle Hooks */
  /*****************************************************************************/
  Template.EmployeeLevelsCreate.onCreated(function () {
    let self = this;
  
    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null)
    self.employeeLevels = new ReactiveVar();
    self.employees = new ReactiveVar();
    if (Template.instance().data) {
      self.employeeLevels.set({
        ...Template.instance().data,
      });
    } else {
      self.employeeLevels.set({
        createdBy: Meteor.user()._id,
        businessId: Session.get('context'),
        name : '',
        label: '',
        code: '',
      });
    }
    self.subscribe("travelcities", Session.get('context'));
  });
  
  Template.EmployeeLevelsCreate.onRendered(function () {
  });
  
  Template.EmployeeLevelsCreate.onDestroyed(function () {
  });

