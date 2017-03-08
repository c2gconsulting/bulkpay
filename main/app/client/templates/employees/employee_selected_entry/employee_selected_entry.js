/*****************************************************************************/
/* EmployeeSelectedEntry: Event Handlers */
/*****************************************************************************/
Template.EmployeeSelectedEntry.events({
  'click #employee-edit-personaldata': function(e, tmpl) {
    let selectedEmployeeId = Session.get('employeesList_selectedEmployeeId');
    if(selectedEmployeeId) {
      Modal.show('EmployeePersonalDataModal');      
    }
  }
});

/*****************************************************************************/
/* EmployeeSelectedEntry: Helpers */
/*****************************************************************************/
Template.EmployeeSelectedEntry.helpers({
  "selectedEmployee": function() {
      let selectedEmployeeId = Session.get('employeesList_selectedEmployeeId');
      return Meteor.users.findOne({_id: selectedEmployeeId});
  },
  "images": (id) => {
      return UserImages.findOne({_id: id});
  }
});

/*****************************************************************************/
/* EmployeeSelectedEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeSelectedEntry.onCreated(function () {
    let self = this;
    Session.set('employeesList_selectedEmployeeId', undefined);

    self.autorun(()=> {

      }
    );
});

Template.EmployeeSelectedEntry.onRendered(function () {
});

Template.EmployeeSelectedEntry.onDestroyed(function () {
  Session.set('employeesList_selectedEmployeeId', undefined);
});
