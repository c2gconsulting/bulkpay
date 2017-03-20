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
        Modal.show('ImportCurrenciesModal');
    },
    'change [name="periodMonth"]': function(e){
      let selectedMonth = e.currentTarget.value;
      console.log("Selected month: " + selectedMonth);

      Template.instance().selectedMonth.set(selectedMonth);
    },
    'change [name="periodYear"]': function(e){
      let selectedYear = e.currentTarget.value;
      console.log("Selected year: " + selectedYear);

      Template.instance().selectedYear.set(selectedYear);
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
    'currenciesCount': function(){
        let selectedMonth = Template.instance().selectedMonth.get();
        let selectedYear = Template.instance().selectedYear.get();
        const period = `${selectedMonth}${selectedYear}`

        return Currencies.find({period: period}).count();
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
    //--
    let theMoment = moment();
    // console.log(`Current month: ${theMoment.month()} ... alternative: ${theMoment.format('MM')}`);
    // console.log(`Current year: ${theMoment.year()}`)
    self.selectedMonth.set(theMoment.format('MM'))
    self.selectedYear.set(theMoment.format('YYYY'))

    self.autorun(function() {
        const period = `${self.selectedMonth.get()}${self.selectedYear.get()}`
        self.subscribe('currenciesForPeriod', period);
    });
});

Template.CurrencyList.onRendered(function () {
    let self = this;

    $('select.dropdown').dropdown();

    $('[name="periodMonth"]').val(self.selectedMonth.get());
    $('[name="periodYear"]').val(self.selectedYear.get());
});

Template.CurrencyList.onDestroyed(function () {
});
