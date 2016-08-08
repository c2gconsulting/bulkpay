Template.DistributorAccountBalanceSection.helpers({
    currentAccountBalance: function(){
        var accounts =  this.account;
        var account =  _.sortBy(accounts, function(accounts){ return -accounts.createdAt; });
        return account[0]
    },
    totalOrders: function(){
        var customerId = this._id;
        var start = moment().utcOffset("+0000").startOf('year').toString();
        var end = moment().utcOffset("+0000").endOf('year').toString();
        return Orders.find({customerId: customerId},{'createdAt' : { $gte : start, $lt: end }}).count();

    },
    prettyTotal: function() {
        let currSymbol = this.currencySymbol ? this.currencySymbol : this.currency; //default to ISO code if no symbol
        if (this.total) return currSymbol + " " + Core.numberWithCommas(this.total);
    },
    numberToCurrency: function(number) {
        let currSymbol = this.currency.symbol ? this.currency.symbol : this.currency.iso; //default to ISO code if no symbol
        if (number) {
            return currSymbol + " " + Core.numberWithDecimals(number);
        } else {
            return currSymbol + " " + Core.numberWithDecimals(0);
        }
    },
    ordersThisYear: function() {
        let customerId = this._id;
        let yearStart = moment().startOf('year').toDate();
        return Orders.find({customerId: customerId, 'issuedAt' : { $gte : yearStart}}).count();
    }
});

Template.DistributorAccountBalanceSection.onRendered(function () {

});