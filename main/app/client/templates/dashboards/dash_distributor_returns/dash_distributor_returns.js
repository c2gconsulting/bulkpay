/*****************************************************************************/
/* DashDistributorReturns: Event Handlers */
/*****************************************************************************/
Template.DashDistributorReturns.events({
    'click a[href="#year"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "Year");
    },
    'click a[href="#quarter"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "Quarter");
    },
    'click a[href="#month"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "Month");
    },
    'click a[href="#all"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "All");
    },
    'click a[href="#week"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "Week");
    },
    'click a[href="#today"]': function (e, tmpl) {
        Template.instance().totalReturns.set('totalReturnsFilter', "Today");
    }
});

/*****************************************************************************/
/* DashDistributorReturns: Helpers */
/*****************************************************************************/
Template.DashDistributorReturns.helpers({
    result: function(){
        return Template.instance().totalReturns.get('filterResult');
    },

    orderFilter: function(){
        return Template.instance().totalReturns.get('totalReturnsFilter');
    },

    filterResult: function () {
        return Template.instance().totalReturns.get('filterResult');
    },
    enableLoading: function () {
        return  Template.instance().totalReturns.get('showLoading');
    }
});

/*****************************************************************************/
/* DashDistributorReturns: Lifecycle Hooks */
/*****************************************************************************/
Template.DashDistributorReturns.onCreated(function () {
    let instance = this;
    instance.totalReturns = new ReactiveDict();
    instance.totalReturns.set('showLoading', true);

    let orderVolumeFilter =  Template.instance().totalReturns.get('totalReturnsFilter');

    if (!orderVolumeFilter){
        instance.totalReturns.set('totalReturnsFilter', "Year");
    }

    instance.autorun(function () {
        orderVolumeFilter =  Template.instance().totalReturns.get('totalReturnsFilter');
        instance.totalReturns.set('showLoading', true);
        Meteor.call("returnorders/totalSales", orderVolumeFilter, function(err, res){
            if (res){
                let data = getOrderData(res);
                if (data){
                    instance.totalReturns.set('filterResult', data);
                    instance.totalReturns.set('showLoading', false);
                }
            }
        });
    });
});

Template.DashDistributorReturns.onRendered(function () {
});

Template.DashDistributorReturns.onDestroyed(function () {
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