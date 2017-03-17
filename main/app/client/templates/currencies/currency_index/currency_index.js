/*****************************************************************************/
/* CurrencyList: Event Handlers */
/*****************************************************************************/
Template.CurrencyList.events({
    'click #newCurrency': function(e){
        e.preventDefault();
        Modal.show('CurrencyCreate');
    },
    'click #uploadCurrencies': function(e){
        e.preventDefault();
        Modal.show('ImportModal');
    }
});

/*****************************************************************************/
/* CurrencyList: Helpers */
/*****************************************************************************/
Template.CurrencyList.helpers({
    'currencies': () => {
        let selectedMonth = Template.instance().selectedMonth.get();
        let selectedYear = Template.instance().selectedYear.get();
        const period = `${selectedMonth}${selectedYear}`
        
        return Currencies.find({period: period});
    },
    'month': () => {
        return Core.months()
    },
    'years': () => {
        return Core.years();
    }
});

/*****************************************************************************/
/* CurrencyList: Lifecycle Hooks */
/*****************************************************************************/
Template.CurrencyList.onCreated(function () {
    let self = this;

    self.selectedMonth = new ReactiveVar();
    self.selectedYear = new ReactiveVar();

    self.autorun(function() {
        let theMoment = moment();
        // console.log(`Current month: ${theMoment.month()} ... alternative: ${theMoment.format('MM')}`);
        // console.log(`Current year: ${theMoment.year()}`)
        self.selectedMonth.set(theMoment.format('MM'))
        self.selectedYear.set(theMoment.format('YYYY'))
        const period = `${self.selectedMonth.get()}${self.selectedYear.get()}`

        self.subscribe('currenciesForPeriod', period);
    });
});

Template.CurrencyList.onRendered(function () {
    $('select.dropdown').dropdown();
});

Template.CurrencyList.onDestroyed(function () {
});
