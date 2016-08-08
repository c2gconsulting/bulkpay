/*****************************************************************************/
/* DashTotalOrderAverageSales: Event Handlers */
/*****************************************************************************/
Template.DashTotalOrderAverageSales.events({
    'click a[href="#year"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "Year");
    },
    'click a[href="#quarter"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "Quarter");
    },
    'click a[href="#month"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "Month");
    },
    'click a[href="#all"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "All");
    },
    'click a[href="#week"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "Week");
    },
    'click a[href="#today"]': function (e, tmpl) {
        Template.instance().averageSales.set('totalSalesFilter', "Today");
    }
});

/*****************************************************************************/
/* DashTotalOrderAverageSales: Helpers */
/*****************************************************************************/
Template.DashTotalOrderAverageSales.helpers({
    result: function(){
        return Template.instance().averageSales.get('filterResult');
    },

    orderFilter: function(){
        return Template.instance().averageSales.get('totalSalesFilter');
    },

    filterResult: function () {
        return Template.instance().averageSales.get('filterResult');
    },
    enableLoading: function () {
        return  Template.instance().averageSales.get('showLoading');
    }
});

/*****************************************************************************/
/* DashTotalOrderAverageSales: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTotalOrderAverageSales.onCreated(function () {
    let instance = this;
    instance.averageSales = new ReactiveDict();
    instance.averageSales.set('showLoading', true);

    let orderVolumeFilter =  Template.instance().averageSales.get('totalSalesFilter');

    if (!orderVolumeFilter){
        instance.averageSales.set('totalSalesFilter', "Year");
    }

    instance.autorun(function () {
        orderVolumeFilter =  Template.instance().averageSales.get('totalSalesFilter');
        instance.averageSales.set('showLoading', true);
        Meteor.call("orders/totalSales", orderVolumeFilter, function(err, res){
            if (res){
                let data = getOrderData(res);
                if (data){
                    instance.averageSales.set('filterResult', data);
                    instance.averageSales.set('showLoading', false);
                }
            }
        });
    });
});

Template.DashTotalOrderAverageSales.onRendered(function () {
});

Template.DashTotalOrderAverageSales.onDestroyed(function () {
});


function  getOrderData(data){
    if (data) {
        let negative = false;
        let current = data.currentDuration[0] ? data.currentDuration[0].totalAmount : 0;
        let totalRecord = data.currentDuration[0] ? data.currentDuration[0].count : 0;
        let amount = (current / totalRecord) || 0;
        if (data.previousDuration){
            let previous = data.previousDuration[0] ? data.previousDuration[0].totalAmount : 0;
            let previousTotalRecord = data.previousDuration[0] ? data.previousDuration[0].count : 0;
            let previousAverage = (previous / previousTotalRecord) || 0;
            if (previousAverage) {
                let diff = ((amount - previousAverage) / previousAverage) * 100;
                if (diff < 0) negative = true;
                return {totalRecord: totalRecord, totalAmount: amount, percentage: Math.abs(diff), oldTotal: previous, negative: negative};
            } else {
                return {totalRecord: totalRecord, totalAmount: amount};
            }
        } else {
            return {totalRecord: totalRecord, totalAmount: amount};
        }
    }
}