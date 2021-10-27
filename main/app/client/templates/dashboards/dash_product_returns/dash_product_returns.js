/*****************************************************************************/
/* DashProductReturns: Event Handlers */
/*****************************************************************************/
Template.DashProductReturns.events({
    'click a[href="#annually"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "Year");
    },
    'click a[href="#quarter"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "Quarter");
    },
    'click a[href="#monthly"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "Monthly");
    },
    'click a[href="#all"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "All");
    },
    'click a[href="#week"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "Week");
    },
    'click a[href="#today"]': function (e, tmpl) {
        Template.instance().state.set('returnorderVolumeFilter', "Today");
    }
});

/*****************************************************************************/
/* DashProductReturns: Helpers */
/*****************************************************************************/
Template.DashProductReturns.helpers({
    totalSum: function(){
        let orderVolumeFilter = Template.instance().state.get('returnorderVolumeFilter');
        let total;
        switch (orderVolumeFilter) {
            case 'Year':
                let currentYearCount = Counts.findOne("CURRENT_YEAR_TOTAL_RETURN_ORDERS");
                let previousYearCount = Counts.findOne("PREVIOUS_YEAR_TOTAL_RETURN_ORDERS");
                total = getOrderData(currentYearCount, previousYearCount);
                break;
            case 'Quarter':
                let currentQuarterCount = Counts.findOne("QUARTERLY_TOTAL_RETURN_ORDERS");
                let previousQuarterCount = Counts.findOne("PREVIOUS_QUARTERLY_TOTAL_RETURN_ORDERS");
                total = getOrderData(currentQuarterCount, previousQuarterCount);
                break;
            case 'Monthly':
                let currentMonthCount = Counts.findOne("CURRENT_MONTH_TOTAL_RETURN_ORDERS");
                let previousMonthCount = Counts.findOne("PREVIOUS_MONTH_TOTAL_RETURN_ORDERS");
                total = getOrderData(currentMonthCount, previousMonthCount);
                break;
            case 'All':
                let totalOrders = Counts.findOne("TOTAL_RETURN_ORDERS");
                totalOrders = totalOrders ? totalOrders.count : 0;
                total = {count: totalOrders};
                break;
            case 'Week':
                let currentWeekCount = Counts.findOne("CURRENT_WEEK_TOTAL_RETURN_ORDERS");
                let previousWeekCount = Counts.findOne("PREVIOUS_WEEK_TOTAL_RETURN_ORDERS");
                total = getOrderData(currentWeekCount, previousWeekCount);
                break;
            case 'Today':
                let todayCount = Counts.findOne("TOTAL_RETURN_ORDERS_TODAY");
                let yesterdayCount = Counts.findOne("TOTAL_RETURN_ORDERS_YESTERDAY");
                total = getOrderData(todayCount, yesterdayCount);
                break;
        }
        return total;
    },

    orderFilter: function(){
        return Template.instance().state.get('returnorderVolumeFilter');
    }
});

/*****************************************************************************/
/* DashProductReturns: Lifecycle Hooks */
/*****************************************************************************/
Template.DashProductReturns.onCreated(function () {
    this.state = new ReactiveDict();
    let orderVolumeFilter =  Template.instance().state.get('returnorderVolumeFilter');
    if (!orderVolumeFilter){
        Template.instance().state.set('returnorderVolumeFilter', "Year");
    }
});

Template.DashProductReturns.onRendered(function () {
});

Template.DashProductReturns.onDestroyed(function () {
});


function getOrderData(current, previous) {
    previous = previous ? previous.count : 0;
    current = current ? current.count : 0;
    let percentageDifference = (1 - (previous/current)) * 100;
    return {count: current, percentage:  Math.abs(percentageDifference), oldCount: previous};
}