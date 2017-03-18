/*****************************************************************************/
/* BusinessUnitActivities: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda';

Template.BusinessUnitActivities.events({

    'click #addActivity': (e,tmpl) => {
        e.preventDefault();
        Template.instance().isAnActivityBeingCreated.set(true);
    },
    'click .deleteActivity': (e,tmpl) => {
        e.preventDefault();
        e.stopPropagation();    // To prevent 'click .anActivity' from being called

        const rowElement = e.currentTarget.closest('tr');
        let jqueryRowElement = $(rowElement);
        let activityId = jqueryRowElement.attr('id');
        console.log("Activity id: " + activityId);

        Meteor.call('activity/delete', activityId, (err, res) => {
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
    },
    'click .anActivity': (e, tmpl) => {
      let taxRuleRowElement = e.currentTarget;

      let activityRowName = taxRuleRowElement.getAttribute("name");
      if(activityRowName) {
        let activityParts = activityRowName.split("_");
        let activityIndex = activityParts[1];
        activityIndex = parseInt(activityIndex);

        Template.instance().indexOfSelectedActivityForEdit.set(activityIndex);
        Template.instance().isAnActivitySelectedForEdit.set(true);
      }
    },
    'click #confirmActivityCreate': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      //--
      let rowFullCode = jqueryRowElement.find('td [name="activityFullCode"]');
      let rowFullCodeVal = rowFullCode.val();

      let rowDescription = jqueryRowElement.find('td [name="activityDescription"]');
      let rowDescriptionVal = rowDescription.val();

      e.stopPropagation();    // To prevent 'click .anActivity' from being called

      if(!rowFullCodeVal || rowFullCodeVal.trim().length == 0) {
        //swal("Validation error", `Please enter a fullcode for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a fullcode for your activity`);
      } else if(!rowDescriptionVal || rowDescriptionVal.trim().length == 0) {
        //swal("Validation error", `Please enter a description for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a description for your activity`);
      } else {
        Template.instance().errorMessage.set(null);

        let l = Ladda.create(tmpl.$('#confirmActivityCreate')[0]);
        l.start();

        let businessUnitId = Template.instance().unitDetails.get()._id;
        let newActivity = {
            fullcode: rowFullCodeVal,
            description: rowDescriptionVal,
            type: "unit",
            unitOrProjectId : businessUnitId,
            businessId : Session.get('context')
        };

        Meteor.call('activity/create', newActivity, (err, res) => {
            l.stop();
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
        Template.instance().isAnActivityBeingCreated.set(false);
      }
    },
    'click #confirmActivityEdit': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      let activityId = jqueryRowElement.attr('id');
      console.log("Activity id: " + activityId);
      //--
      let rowFullCode = jqueryRowElement.find('td [name="activityFullCode"]');
      let rowFullCodeVal = rowFullCode.val();

      let rowDescription = jqueryRowElement.find('td [name="activityDescription"]');
      let rowDescriptionVal = rowDescription.val();

      e.stopPropagation();    // To prevent 'click .anActivity' from being called

      if(!rowFullCodeVal || rowFullCodeVal.trim().length == 0) {
        //swal("Validation error", `Please enter a fullcode for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a fullcode for your activity`);
      } else if(!rowDescriptionVal || rowDescriptionVal.trim().length == 0) {
        //swal("Validation error", `Please enter a description for your activity`, "error");
        Template.instance().errorMessage.set(`Please enter a description for your activity`);
      } else {
        Template.instance().errorMessage.set(null);

        let l = Ladda.create(tmpl.$('#confirmActivityEdit')[0]);
        l.start();

        let updatedActivity = {
            fullcode: rowFullCodeVal,
            description: rowDescriptionVal
        };

        Meteor.call('activity/update', activityId, updatedActivity, (err, res) => {
            l.stop();
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
        Template.instance().indexOfSelectedActivityForEdit.set(null);
        Template.instance().isAnActivitySelectedForEdit.set(false);
      }
    },
    'click #cancelActivityEdit': (e, tmpl) => {
      e.preventDefault();
      e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called

      Template.instance().isAnActivityBeingCreated.set(false);
      Template.instance().indexOfSelectedActivityForEdit.set(null);
      Template.instance().isAnActivitySelectedForEdit.set(false);
    }
});

/*****************************************************************************/
/* BusinessUnitActivities: Helpers */
/*****************************************************************************/
Template.BusinessUnitActivities.helpers({
    'status': () => {
        return [{label: "Active", value: "Active"},{label: "Inactive", value: "Inactive"}];
    },
    'formAction': () => {
        if(Template.instance().data)
            return "update";
        return "insert";
    },
    'unitName': () => {
        return Template.instance().unitDetails.get().name;
    },
    'errorMessage': () => {
        return Template.instance().errorMessage.get();
    },
    'activities': () => {
        let unitDetails = Template.instance().unitDetails.get();

        return Activities.find({type: "unit", unitOrProjectId: unitDetails._id});
    },
    'editableActivities': () => {
        return Template.instance().editableProjectActivities.get();
    },
    'isAnActivityBeingCreated' : function() {
      return Template.instance().isAnActivityBeingCreated.get();
    },
    'isActivitySelected' : function() {
      return Template.instance().isAnActivitySelectedForEdit.get();
    },
    'indexOfSelectedActivity' : function() {
      return Template.instance().indexOfSelectedActivityForEdit.get();
    },
});



/*****************************************************************************/
/* BusinessUnitActivities: Lifecycle Hooks */
/*****************************************************************************/
Template.BusinessUnitActivities.onCreated(function () {
    let self = this;
    //--
    let unitId = Template.instance().data;
    console.log(`template instance data(unitid): ${unitId}`);

    let unitDetails = EntityObjects.findOne({_id: unitId});

    self.unitDetails = new ReactiveVar();
    self.unitDetails.set(unitDetails);

    //--
    self.editableProjectActivities = new ReactiveVar();
    self.editableProjectActivities.set(null);

    self.isAnActivityBeingCreated = new ReactiveVar();
    self.isAnActivityBeingCreated.set(false);

    self.isAnActivitySelectedForEdit = new ReactiveVar();
    self.isAnActivitySelectedForEdit.set(false);

    self.indexOfSelectedActivityForEdit = new ReactiveVar();
    self.indexOfSelectedActivityForEdit.set(null);

    self.errorMessage = new ReactiveVar();
    self.errorMessage.set(null);

    self.autorun(function () {
        let activitiesSubscription = self.subscribe('activities', "unit", self.unitDetails.get()._id);

        if (activitiesSubscription.ready()) {
            console.log("activities subscription is ready");
            let activitiesFromDb = Activities.find({
                type: "unit",
                unitOrProjectId: self.unitDetails.get()._id
            }).fetch();
            self.editableProjectActivities.set(activitiesFromDb);
        }
    });
});

Template.BusinessUnitActivities.onRendered(function () {
});

Template.BusinessUnitActivities.onDestroyed(function () {
});
