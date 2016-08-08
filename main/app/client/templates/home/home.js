/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.Home.events({
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({
    allSales: function () {
        let collection;
        Meteor.call("orders/totalSales", function(err, res){
            if (!err) collection = res
        });
        if (collection){
            
        } return collection[0]
    },
    
    defaultSales: function(){
        
    },
    
    unpaidInvoices: function () {
        let unpaidInvoices = Counts.findOne("UNPAID_INVOICES");
        let count = unpaidInvoices ? unpaidInvoices.count : 0;
        let total = unpaidInvoices ? unpaidInvoices.total : 0;
        return {count: count, total: total}
    }
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
});

Template.Home.onRendered(function () {
        var rndSF = function() {
            return Math.round(Math.random()*100);
        };
    
});

Template.Home.onDestroyed(function () {
});
