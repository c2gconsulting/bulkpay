/*****************************************************************************/
/* AccountEntry: Event Handlers */
/*****************************************************************************/
Template.AccountEntry.events({
  'click .user-entry': function (e, tmpl) {
    Router.go('account.detail', {_id: this._id});
  }
});

/*****************************************************************************/
/* AccountEntry: Helpers */
/*****************************************************************************/
Template.AccountEntry.helpers({
  email: function () {
    return this.emails[0].address;
  }
});

/*****************************************************************************/
/* AccountEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountEntry.onCreated(function () {
});

Template.AccountEntry.onRendered(function () {
});

Template.AccountEntry.onDestroyed(function () {
});
