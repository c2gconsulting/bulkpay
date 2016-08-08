/*****************************************************************************/
/* LocationEntry: Event Handlers */
/*****************************************************************************/
Template.LocationEntry.events({
  'click .location-entry': function () {
    this.holdsStock = true;
    Session.set('editLocation', this);
    Modal.show('LocationCreate');
  }
});

/*****************************************************************************/
/* LocationEntry: Helpers */
/*****************************************************************************/
Template.LocationEntry.helpers({
});

/*****************************************************************************/
/* LocationEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.LocationEntry.onCreated(function () {
});

Template.LocationEntry.onRendered(function () {
});

Template.LocationEntry.onDestroyed(function () {
});
