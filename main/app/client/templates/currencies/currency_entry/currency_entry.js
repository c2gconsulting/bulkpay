/*****************************************************************************/
/* CurrencyEntry: Event Handlers */
/*****************************************************************************/
Template.CurrencyEntry.events({
  'click .deleteCurrency': function(e, tmpl) {
    event.preventDefault();

    if(tmpl.data && tmpl.data.data) {
      let self = this;

      swal({
          title: "Are you sure?",
          text: "You will not be able to recover this currency",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, delete it!",
          closeOnConfirm: false
      }, () => {
        let realCurrencyData = tmpl.data.data;
  
        let currencyCode = realCurrencyData.code;
        let rateToBaseCurrency = realCurrencyData.rateToBaseCurrency;
        let period = realCurrencyData.period;
  
        let businessId = Session.get('context')
  
        Meteor.call('currency/deleteCurrencyForPeriod', currencyCode, period, businessId, function(err, res) {
          if(res) {
            Modal.hide();
            swal("Deleted!", `Currency: ${currencyCode} has been deleted.`, "success");
          }
        })
      });
    }
  }
});

/*****************************************************************************/
/* CurrencyEntry: Helpers */
/*****************************************************************************/
Template.CurrencyEntry.helpers({
});

/*****************************************************************************/
/* CurrencyEntry: Lifecycle Hooks */
/*****************************************************************************/
Template.CurrencyEntry.onCreated(function () {
});

Template.CurrencyEntry.onRendered(function () {
});

Template.CurrencyEntry.onDestroyed(function () {
});
