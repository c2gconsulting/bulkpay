/*****************************************************************************/
/* CurrencyCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.CurrencyCreate.events({
    'click #createCurrency': (e, tmpl) => {
        e.preventDefault();
        //--
        let currentTenantId = Session.get('context');

        let selectedMonth = $('[name="periodMonth"]').val();
        let selectedYear = $('[name="periodYear"]').val();
        let currencyCode = $('[name="currencyCode"]').val()
        let currencyRate = $('[name="rateToBaseCurrency"]').val()

        if(currencyCode.length < 1) {
            swal("Validation error", `Please choose the currency`, "error");
            return
        } else if(currencyRate.length < 1) {
            swal("Validation error", `Please enter the exchange rate of the currency`, "error");
            return
        } else {
            currencyRate = parseFloat(currencyRate)

            if(selectedMonth.length < 1) {
                swal("Validation error", `Please choose a month`, "error");
                return
            } else if(selectedYear.length < 1) {
                swal("Validation error", `Please choose a year`, "error");
                return
            }
        }
        //--
        let l = Ladda.create(tmpl.$('#createCurrency')[0]);
        l.start();

        const newCurrencyDetails = {
            businessId: currentTenantId,
            code: currencyCode,
            rateToBaseCurrency: currencyRate,
            period: `${selectedMonth}${selectedYear}`,
        };
        console.log(`new current details: ${JSON.stringify(newCurrencyDetails)}`)
        //--

        Meteor.call('currency/create', newCurrencyDetails, (err, res) => {
            l.stop();
            if (res){
                Modal.hide('CurrencyCreate');
                swal({
                    title: "Success",
                    text: `Currency created`,
                    confirmButtonClass: "btn-success",
                    type: "success",
                    confirmButtonText: "OK"
                });
            } else {
                swal("Validation error", err.message, "error");
            }
        });
    }
});

/*****************************************************************************/
/* CurrencyCreate: Helpers */
/*****************************************************************************/
Template.CurrencyCreate.helpers({
    'allCurrencies': () => {
        return Core.currencies();
    },
    'month': () => {
        return Core.months()
    },
    'years': () => {
        return Core.years();
    },
    selectedMonth: function (val) {
        if(Template.instance().selectedMonth.get()) {
            return Template.instance().selectedMonth.get() === val ? selected="selected" : '';
        }
    },
    selectedYear: function (val) {
        if(Template.instance().selectedYear.get()) {
            return Template.instance().selectedYear.get() === val ? selected="selected" : '';
        }
    }
});

/*****************************************************************************/
/* CurrencyCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.CurrencyCreate.onCreated(function () {
    let self = this;

    self.selectedMonth = new ReactiveVar();
    self.selectedYear = new ReactiveVar();
    //--
    let theMoment = moment();
    self.selectedMonth.set(theMoment.format('MM'))
    self.selectedYear.set(theMoment.format('YYYY'))
});

Template.CurrencyCreate.onRendered(function () {
    $('select.dropdown').dropdown();

    // $('[name="periodMonth"]').val(currentMonth);
    // $('[name="periodYear"]').val(currentYear);
});

Template.CurrencyCreate.onDestroyed(function () {
});
