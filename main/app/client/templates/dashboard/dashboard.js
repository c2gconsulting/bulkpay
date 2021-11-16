/*****************************************************************************/
/* Dashboard: Event Handlers */
/*****************************************************************************/
Template.Dashboard.events({
});

/*****************************************************************************/
/* Dashboard: Helpers */
/*****************************************************************************/
Template.Dashboard.helpers({
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
        let unpaidInvoices = {} // Counts.findOne("UNPAID_INVOICES");
        let count = unpaidInvoices ? unpaidInvoices.count : 0;
        let total = unpaidInvoices ? unpaidInvoices.total : 0;
        return {count: count, total: total}
    }
});

/*****************************************************************************/
/* Dashboard: Lifecycle Hooks */
/*****************************************************************************/
Template.Dashboard.onCreated(function () {
});

Template.Dashboard.onRendered(function () {
        var rndSF = function() {
            return Math.round(Math.random()*100);
        };
    
});

Template.Dashboard.onDestroyed(function () {
});
