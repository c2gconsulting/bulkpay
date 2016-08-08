Template.DistributorSelectBillingAddress.helpers({
    billingAddresses: function(){
       return this.addressBook
    },

    isSelectedBilling: function(){
        if (this.isBillingDefault == true) return "Yes"
    },
    selectedIf: function(val){
        return val ? 'selected' : '';
    }
});

Template.DistributorSelectShippingAddress.helpers({
    shippingAddresses: function(){
        return this.addressBook
    },
    isSelectedShipping: function(){
        if (this.isShippingDefault == true) return "Yes"
    },
    selectedIf: function(val){
        return val ? 'selected' : '';
    }
});