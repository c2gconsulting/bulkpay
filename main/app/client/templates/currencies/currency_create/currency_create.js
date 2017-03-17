/*****************************************************************************/
/* CurrencyCreate: Event Handlers */
/*****************************************************************************/
import Ladda from 'ladda';

Template.CurrencyCreate.events({
    'click #createCurrency': (e, tmpl) => {
        event.preventDefault();
        let l = Ladda.create(tmpl.$('#createCurrency')[0]);
        l.start();
        //--
        let currentTenantId = Session.get('context');
        console.log(`Current tenantId: ${currentTenantId}`);
        let selectedMonth = $('[name="periodMonth"]').val();
        let selectedYear = $('[name="periodYear"]').val();

        const newCurrencyDetails = {
            businessId: currentTenantId,
            code: $('[name="currencyCode"]').val(),
            rateToBaseCurrency: parseFloat($('[name="rateToBaseCurrency"]').val()),
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
                console.log('got to the error part');
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
    }
});

/*****************************************************************************/
/* CurrencyCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.CurrencyCreate.onCreated(function () {
});

Template.CurrencyCreate.onRendered(function () {
    $('select.dropdown').dropdown();

    let theMoment = moment();
    let currentMonth = theMoment.format('MM')
    let currentYear = theMoment.format('YYYY')

    $('[name="periodMonth"]').val(currentMonth);
    $('[name="periodYear"]').val(currentYear);
});

Template.CurrencyCreate.onDestroyed(function () {
});
