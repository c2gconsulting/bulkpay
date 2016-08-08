/*****************************************************************************/
/* ReturnEntry: Event Handlers */
/*****************************************************************************/
Template.ReturnEntry.events({
  'click .return-entry': function(e, tmpl) {
    Router.go('returns.detail', {
      _id: this._id
    });
  }
});

/*****************************************************************************/
/* ReturnEntry: Helpers */
/*****************************************************************************/
Template.ReturnEntry.helpers({
  returnStatusStyle: function() {
    if (this.status === 'pending') return 'text-warning';
    if (this.status === 'approved') return 'text-success';
  }
});

/*****************************************************************************/
/* ReturnEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.ReturnEntry.onCreated(function() {});

Template.ReturnEntry.onRendered(function() {});

Template.ReturnEntry.onDestroyed(function() {});
