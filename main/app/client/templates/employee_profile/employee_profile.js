/*****************************************************************************/
/* EmployeeProfile: Event Handlers */
/*****************************************************************************/

Template.EmployeeProfile.events({

});

/*****************************************************************************/
/* EmployeeProfile: Helpers */
/*****************************************************************************/
Template.EmployeeProfile.helpers({
    "currentEmployee": () => {
      return [Template.instance().currentEmployee.get()];
    },
    "images": (id) => {
        return UserImages.findOne({_id: id});
    },
    positionName: (id)=> {
        if(id)
          return EntityObjects.findOne({_id: id}).name;
        else {
          return "";
        }
    },
});

/*****************************************************************************/
/* EmployeeProfile: Lifecycle Hooks */
/*****************************************************************************/
Template.EmployeeProfile.onCreated(function () {
    let self = this;
    self.currentEmployee = new ReactiveVar();
    self.currentEmployee.set(Meteor.users.findOne({_id: Meteor.userId()}));

    console.log("currentEmployee: " + JSON.stringify(self.currentEmployee.get()));
});

Template.EmployeeProfile.onRendered(function () {
});

Template.EmployeeProfile.onDestroyed(function () {
});
