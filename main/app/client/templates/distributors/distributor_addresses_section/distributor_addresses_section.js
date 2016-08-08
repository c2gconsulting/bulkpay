Template.DistributorAddressesSection.helpers({
    activeBillingAddress: function(){
        if (this.addressBook.length > 0) return currentBillingAddress(this.addressBook);
    },
    hasAddressBook: function(){
        if (! _.isEmpty(this.addressBook)){
            return true
        }
    },
    addressBillingRegion: function(){
        var addressBook = currentBillingAddress(this.addressBook);
       if (! _.isEmpty(addressBook)){
           var region = [addressBook.city, addressBook.state, addressBook.country];
           return region.join(", ");
       }
    },
    addressShippingRegion: function(){
        var addressBook = currentShippingAddress(this.addressBook);
        if (! _.isEmpty(addressBook)){
            var region = [addressBook.city, addressBook.state, addressBook.country];
            return region.join(", ");
        }
    },
    activeShippingAddress: function(){
        if (this.addressBook.length > 0) return currentShippingAddress(this.addressBook);
    },

    isDefaultShipping: function(){
        let groupCode = getCustomerGroup(this.groupCode);
        if (groupCode) {
            if (getCustomerGroup(this.groupCode).isPickupDefault == true) return "Yes"
        }
    },
    isNotDefaultShipping: function(){
        let groupCode = getCustomerGroup(this.groupCode);
        if (groupCode) {
            if (getCustomerGroup(this.groupCode).isPickupDefault == false) return "Yes"
        }
    },
    checkedIf: function(val){
        return val ? 'checked' : '';
    }

});

Template.DistributorAddressesSection.events({
    "change #billing .changeAddress": function (event) {
       var addressId = $(event.target).val();
      Meteor.call("customers/updateBillingAddress", this._id, addressId);
    },

    "change #shipping .changeAddress": function (event) {
        var addressId = $(event.target).val();
        Meteor.call("customers/updateShippingAddress", this._id, addressId);
    }
});

function getCustomerGroup(groupCode){
   return CustomerGroups.findOne({code: (groupCode)})
}

