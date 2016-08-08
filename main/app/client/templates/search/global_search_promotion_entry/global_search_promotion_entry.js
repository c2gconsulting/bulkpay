/*****************************************************************************/
/* GlobalSearchPromotionEntry: Event Handlers */
/*****************************************************************************/
Template.GlobalSearchPromotionEntry.events({
});

/*****************************************************************************/
/* GlobalSearchPromotionEntry: Helpers */
/*****************************************************************************/
Template.GlobalSearchPromotionEntry.helpers({
  statusLabel: function () {
    // ["active", "pending", "suspended", "ended"]
    switch (this.status) {
      case 'active':
        return 'since';
      case 'ended':
        return 'on';
      default:
        return '';
    }
  },
  statusDate: function () {
    const status = this.status;
    let historyObject;
    _.each(this.history, function (history) {
      if (history && history.newValue === status) {
        historyObject = history;
      }
    });
    return historyObject ? historyObject.createdAt : historyObject;
  }
});

/*****************************************************************************/
/* GlobalSearchPromotionEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.GlobalSearchPromotionEntry.onCreated(function () {
});

Template.GlobalSearchPromotionEntry.onRendered(function () {
});

Template.GlobalSearchPromotionEntry.onDestroyed(function () {
});
