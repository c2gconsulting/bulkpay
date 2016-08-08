/*****************************************************************************/
/* DashOrderVolumes: Event Handlers */
/*****************************************************************************/
Template.DashOrderVolumes.events({
    'click a[href="#year"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "Year");
    },
    'click a[href="#quarter"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "Quarter");
    },
    'click a[href="#month"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "Month");
    },
    'click a[href="#all"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "All");
    },
    'click a[href="#week"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "Week");
    },
    'click a[href="#today"]': function (e, tmpl) {
        Template.instance().totalOrders.set('totalSalesFilter', "Today");
    }
});

/*****************************************************************************/
/* DashOrderVolumes: Helpers */
/*****************************************************************************/
Template.DashOrderVolumes.helpers({
    result: function(){
        return Template.instance().totalOrders.get('filterResult');
    },

    orderFilter: function(){
        return Template.instance().totalOrders.get('totalSalesFilter');
    },
    filterResult: function () {
        return Template.instance().totalOrders.get('filterResult');
    },
    enableLoading: function () {
        return  Template.instance().totalOrders.get('showLoading');
    }
});

/*****************************************************************************/
/* DashOrderVolumes: Lifecycle Hooks */
/*****************************************************************************/
Template.DashOrderVolumes.onCreated(function () {
    let instance = this;
    instance.totalOrders = new ReactiveDict();
    instance.totalOrders.set('showLoading', true);

    let orderVolumeFilter =  Template.instance().totalOrders.get('totalSalesFilter');

    if (!orderVolumeFilter){
        instance.totalOrders.set('totalSalesFilter', "Year");
    }

    instance.autorun(function () {
        orderVolumeFilter =  Template.instance().totalOrders.get('totalSalesFilter');
        instance.totalOrders.set('showLoading', true);
        Meteor.call("orders/totalSales", orderVolumeFilter, "totalOrders", function(err, res){
            if (res){
                let data = getOrderData(res);
                if (data){
                    instance.totalOrders.set('filterResult', data);
                    instance.totalOrders.set('showLoading', false);
                }
            }
        });
    });
});

Template.DashOrderVolumes.onRendered(function () {
});

Template.DashOrderVolumes.onDestroyed(function () {
});


function  getOrderData(data){
    if (data) {
        let negative = false;
        let totalRecord = data.currentDuration[0] ? data.currentDuration[0].count : 0;
        if (data.previousDuration){
            let previousTotalRecord = data.previousDuration[0] ? data.previousDuration[0].count : 0;
            if (previousTotalRecord) {
                let diff = ((totalRecord - previousTotalRecord) / previousTotalRecord) * 100;
                if (diff < 0) negative = true;
                return {totalRecord: totalRecord, percentage: Math.abs(diff),  negative: negative};
            } else {
                return {totalRecord: totalRecord};
            }
        } else {
            return {totalRecord: totalRecord};
        }
    }
}