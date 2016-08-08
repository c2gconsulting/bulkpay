/*****************************************************************************/
/* DashTotalOrderSales: Event Handlers */
/*****************************************************************************/
Template.DashTotalOrderSales.events({
    'click a[href="#annually"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "Year");
    },
    'click a[href="#quarter"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "Quarter");
    },
    'click a[href="#monthly"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "Month");
    },
    'click a[href="#all"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "All");
    },
    'click a[href="#week"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "Week");
    },
    'click a[href="#today"]': function (e, tmpl) {
        Template.instance().totalSales.set('totalSalesFilter', "Today");
    }
});

/*****************************************************************************/
/* DashTotalOrderSales: Helpers */
/*****************************************************************************/
Template.DashTotalOrderSales.helpers({
    result: function(){
        return Template.instance().totalSales.get('filterResult');
    },

    adjResultTotal: function(){
        let result = Template.instance().totalSales.get('filterResult');
        let totalAmount = result ? result.totalAmount : 0;
        return totalAmount >= 1000000000 ? totalAmount / 1000 : totalAmount;
    },

    nearestThou: function(){
        let result = Template.instance().totalSales.get('filterResult');
        let totalAmount = result ? result.totalAmount : 0;
        return totalAmount >= 1000000000 ? "('000)" : '';
    },

    orderFilter: function(){
        return Template.instance().totalSales.get('totalSalesFilter');
    },
    
    filterResult: function () {
        return Template.instance().totalSales.get('filterResult');
    },
    enableLoading: function () {
        return  Template.instance().totalSales.get('showLoading');
    }
});

/*****************************************************************************/
/* DashTotalOrderSales: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTotalOrderSales.onCreated(function () {
    let instance = this;
    instance.totalSales = new ReactiveDict();
    instance.totalSales.set('showLoading', true);

    let orderVolumeFilter =  Template.instance().totalSales.get('totalSalesFilter');

    if (!orderVolumeFilter){
        instance.totalSales.set('totalSalesFilter', "Year");
    }

    instance.autorun(function () {
        orderVolumeFilter =  Template.instance().totalSales.get('totalSalesFilter');
        instance.totalSales.set('showLoading', true);
        Meteor.call("orders/totalSales", orderVolumeFilter, function(err, res){
            if (res){
                let data = getOrderData(res);
                if (data){
                    instance.totalSales.set('filterResult', data);
                    instance.totalSales.set('showLoading', false);
                }
            }
        });
    });
});

Template.DashTotalOrderSales.onRendered(function () {
    
});

Template.DashTotalOrderSales.onDestroyed(function () {
});


function  getOrderData(data){
    if (data) {
        let negative = false;
        let current = data.currentDuration[0] ? data.currentDuration[0].totalAmount : 0;
        let totalRecord = data.currentDuration[0] ? data.currentDuration[0].count : 0;
        if (data.previousDuration){
            let previous = data.previousDuration[0] ? data.previousDuration[0].totalAmount : 0;
            if (previous) {
                let diff = ((current - previous) / previous) * 100;
                if (diff < 0) negative = true;
                return {totalRecord: totalRecord, totalAmount: current, percentage: Math.abs(diff), oldTotal: previous, negative: negative};
            } else {
                return {totalRecord: totalRecord, totalAmount: current};
            }
        } else {
            return {totalRecord: totalRecord, totalAmount: current};
        }
    }
}