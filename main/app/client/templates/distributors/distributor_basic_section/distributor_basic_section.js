Template.DistributorBasicSection.helpers({
    activeContactNumber: function(){
        if (! _.isEmpty(this.addressBook)) return currentBillingAddress(this.addressBook);
    },
    group: function(){
        return CustomerGroups.findOne({ code: this.groupCode});
    },
    location: function(){
        let location = Locations.findOne(this.defaultSalesLocationId)
        if (location){
            return location.name
        }
    }
});


Template.DistributorBasicSection.onCreated(function() {
    let instance = this;
    instance.autorun(function () {
        let subscription = instance.subscribe('Location', Template.parentData().defaultSalesLocationId);
    });
});