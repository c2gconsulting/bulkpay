/*****************************************************************************/
/* PromotionDetail: Event Handlers */
/*****************************************************************************/
Template.PromotionDetail.events({});

/*****************************************************************************/
/* PromotionDetail: Helpers */
/*****************************************************************************/
Template.PromotionDetail.helpers({
  promotion: function() {
    return this;
  },
  prettyDate: function(date) {
    return moment(date).format('DD/MM/YYYY');
  },
  add: function(a, b) {
    return a + b;
  }
});

/*****************************************************************************/
/* PromotionDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.PromotionDetail.onCreated(function() {});

Template.PromotionDetail.onRendered(function() {

});

Template.PromotionDetail.onDestroyed(function() {});
