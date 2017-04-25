/*****************************************************************************/
/* EmployeeProfile: Event Handlers */
/*****************************************************************************/

Template.EmployeeProfile.events({

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

    console.log("currentEmployee: " + JSON.stringify(self.currentEmployee.get()));
});

Template.EmployeeProfile.onRendered(function () {
});

Template.EmployeeProfile.onDestroyed(function () {
});
