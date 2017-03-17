/*****************************************************************************/
/* CurrrencyList: Event Handlers */
/*****************************************************************************/

import Ladda from 'ladda';

Template.CurrrencyList.events({
     'click #createCurrency': (e,tmpl) => {
        e.preventDefault();
        //Modal.show('ConstantCreate');
    },
    'click .deleteCurrency': (e,tmpl) => {
        e.preventDefault();
        e.stopPropagation();    // To prevent 'click .aCurrency' from being called

        const rowElement = e.currentTarget.closest('tr');
        let jqueryRowElement = $(rowElement);
        let currencyId = jqueryRowElement.attr('id');
        console.log("Currency id: " + currencyId);

        Meteor.call('currency/delete', currencyId, (err, res) => {
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
    },
    'click .aCurrency': (e, tmpl) => {
      let taxRuleRowElement = e.currentTarget;

      let currencyRowName = taxRuleRowElement.getAttribute("name");
      if(currencyRowName) {
        let currencyParts = currencyRowName.split("_");
        let currencyndex = currencyParts[1];
        currencyndex = parseInt(currencyndex);

        Template.instance().indexOfSelectedCurrency.set(currencyndex);
        Template.instance().isCurrencySelectedForEdit.set(true);
      }
    },
    'click #confirmCurrencyEdit': (e, tmpl) => {
      const rowElement = e.currentTarget.closest('tr');
      let jqueryRowElement = $(rowElement);
      let currencyId = jqueryRowElement.attr('id');
      console.log("currencyId: " + currencyId);
      //--
      let rowCode = jqueryRowElement.find('td [name="currencyCode"]');
      let rowCodeVal = rowCode.val();

      let rowValueToNaira = jqueryRowElement.find('td [name="currencyValueToNaira"]');
      let rowValueToNairaVal = rowValueToNaira.val();

      e.stopPropagation();    // To prevent 'click .anActivity' from being called

      if(!rowCodeVal || rowCodeVal.trim().length == 0) {
        //swal("Validation error", `Please enter a fullcode for your activity`, "error");
        //Template.instance().errorMessage.set(`Please enter a fullcode for your activity`);
      } else if(!rowValueToNairaVal || rowValueToNairaVal.trim().length == 0) {
        //swal("Validation error", `Please enter a description for your activity`, "error");
        //Template.instance().errorMessage.set(`Please enter a description for your activity`);
      } else {
        //Template.instance().errorMessage.set(null);

        let l = Ladda.create(tmpl.$('#confirmCurrencyEdit')[0]);
        l.start();

        let updatedCurrency = {
            code: rowCodeVal,
            valueToNaira: rowValueToNairaVal
        };

        Meteor.call('currencyy/update', currencyId, updatedActivity, (err, res) => {
            l.stop();
            if (res){

            } else {
              swal("Server error", `Please try again at a later time`, "error");
            }
        });
        Template.instance().indexOfSelectedCurrencyForEdit.set(null);
        Template.instance().isCurrencySelectedForEdit.set(false);
      }
    },
    'click #cancelCurrencyEdit': (e, tmpl) => {
      e.preventDefault();
      e.stopPropagation();    // To prevent 'click .aTaxRuleItem' from being called
      
      Template.instance().indexOfSelectedCurrencyForEdit.set(null);
      Template.instance().isCurrencySelectedForEdit.set(false);
    }
});

/*****************************************************************************/
/* CurrrencyList: Helpers */
/*****************************************************************************/
Template.CurrrencyList.helpers({
    'data': () => {
        return Template.instance().data ? true:false;
    },
    'currencies': () => {
        return Currencies.find();
    },
    'editableCurrencies': () => {
        return Template.instance().editableCurrencies.get();
    },
    'isCurrencySelected' : function() {
      return Template.instance().isCurrencySelectedForEdit.get();
    },
    'indexOfSelectedCurrency' : function() {
      return Template.instance().indexOfSelectedCurrencyForEdit.get();
    },
});



/*****************************************************************************/
/* CurrrencyList: Lifecycle Hooks */
/*****************************************************************************/
Template.CurrrencyList.onCreated(function () {
    let self = this;
    //--
    self.editableCurrencies = new ReactiveVar();
    self.editableCurrencies.set(null);

    self.isCurrencySelectedForEdit = new ReactiveVar();
    self.isCurrencySelectedForEdit.set(false);

    self.indexOfSelectedCurrencyForEdit = new ReactiveVar();
    self.indexOfSelectedCurrencyForEdit.set(null);

    self.autorun(function () {
        let currenciesSubscription = self.subscribe('currencies');

        if (currenciesSubscription.ready()) {
            console.log("currencies subscription is ready");
            let currenciesFromDb = Currencies.find().fetch();
            self.editableCurrencies.set(currenciesFromDb);
        }
    });
});

Template.CurrrencyList.onRendered(function () {
});

Template.CurrrencyList.onDestroyed(function () {
});