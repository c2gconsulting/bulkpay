/*****************************************************************************/
/* Loans: Event Handlers */
/*****************************************************************************/
Template.LoansNew.events({
  'click #cancel': function(e, tmpl) {
    window.history.back();
  },
  'click #apply': function(e, tmpl) {
    e.preventDefault();
    console.log(`apply button clicked.`)


    
  }
});

/*****************************************************************************/
/* Loans: Helpers */
/*****************************************************************************/
Template.LoansNew.helpers({
});

/*****************************************************************************/
/* Loans: Lifecycle Hooks */
/*****************************************************************************/
Template.LoansNew.onCreated(function () {
});

Template.LoansNew.onRendered(function () {
});

Template.LoansNew.onDestroyed(function () {
});
