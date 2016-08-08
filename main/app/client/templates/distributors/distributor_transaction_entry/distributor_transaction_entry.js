Template.DistributorTransactionEntry.helpers({
    numberToCurrency: function(number) {
        let currSymbol = this.currency && this.currency.symbol ? this.currency.symbol : this.currency.iso; //default to ISO code if no symbol
        return currSymbol + " " + Core.numberWithCommas(number);
    },
    textStyle: function() {
        if (this.transactionType === 'invoices') return 'label-warning';
        if (this.transactionType === 'payments') return 'label-success';
        if (this.transactionType === 'rebates') return 'label-info';
        if (this.transactionType === 'other_credits') return 'label-info';
        if (this.transactionType === 'other_credits') return 'label-info';
        if (this.transactionType === 'hold') return 'label-default';
        if (this.transactionType === 'credit hold') return 'label-default';
    },
    isHold: function(){
        if(this.transactionType === "hold" || this.transactionType === "credit hold") return true
    },
    isCreditHold: function(){
        if(this.transactionType === "credit hold") return true
    },
    isInvoice: function(){
        if(this.transactionType === "invoices") return true
    },
    holdType: function () {
        if (this.transactionType === 'hold') return 'Hold';
        if (this.transactionType === 'credit hold') return 'Credit';
    },
    isPayment: function(){
        if(this.transactionType === "payment") return true
    },
    holdNumber: function(){
       return  this.customerNumber.concat(this.orderNumber)
    },
    isInvoiceAndHasId: function(){
        if(this.transactionType === "invoices" && this.invoiceId) return true
    },
    isPaymentAndHasId: function(){
        if(this.transactionType === "payments" && this.orderId) return true
    },
    referenceDoc: function(){
        return this.orderNumber ? this.orderNumber : ( this.reference ? this.reference : "None" );
    }
});
