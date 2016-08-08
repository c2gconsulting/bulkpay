/*****************************************************************************/
/* StockAdjustmentDetail: Event Handlers */
/*****************************************************************************/
Template.StockAdjustmentDetail.events({
  'submit form#order-note': function(e, tmpl) {
    e.preventDefault();
    let message = tmpl.find('input[name=txtNote]').value;
    if (message) {
      //add message
      Meteor.call('stockAdjustments/addNote', this._id, message);
      tmpl.find('form#order-note').reset();
    }
  }
});

/*****************************************************************************/
/* StockAdjustmentDetail: Helpers */
/*****************************************************************************/
Template.StockAdjustmentDetail.helpers({
  documentAvailable: function(){
    return this._id ? true : false
  },
  currentUserAvatar: function(){
    return UserImages.findOne({owner: Meteor.userId()})
  },
  transferNotes: function() {
    return  _.sortBy(this.notes, function(note) { return -note.createdAt; })
  },
  avatar: function () {
    return UserImages.findOne({owner: this.userId})
  }
});

/*****************************************************************************/
/* StockAdjustmentDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.StockAdjustmentDetail.onCreated(function () {
  let instance = this;
  this.autorun(function () {
    instance.subscribe('VariantsForAdjustment', Template.parentData()._id);
    UserSubs.subscribe('OrderUsers', Template.parentData()._id);
    instance.subscribe('StockTransferImages', Template.parentData()._id);
  });
});

Template.StockAdjustmentDetail.onRendered(function () {
});

Template.StockAdjustmentDetail.onDestroyed(function () {
});
