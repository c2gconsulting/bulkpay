/*****************************************************************************/
/* DashTopCustomerGroups: Event Handlers */
/*****************************************************************************/
Template.DashTopCustomerGroups.events({
    'click a[href="#annually"]': function (e, tmpl) {
        tmpl.topCustomerGroupsFilter.set('Year');
    },

    'click a[href="#month"]': function (e, tmpl) {
        tmpl.topCustomerGroupsFilter.set('Month');
    },

    'click a[href="#week"]': function (e, tmpl) {
        tmpl.topCustomerGroupsFilter.set('Week');
    },

    'click a[href="#today"]': function (e, tmpl) {
        tmpl.topCustomerGroupsFilter.set('Today');
    }
});

/*****************************************************************************/
/* DashTopCustomerGroups: Helpers */
/*****************************************************************************/
Template.DashTopCustomerGroups.helpers({
    topCustomerGroupsFilter: function () {
        return Template.instance().topCustomerGroupsFilter.get();
    },
    enableLoading: function () {
        return  Template.instance().topCustomerGroups.get('showLoading');
    }
});

/*****************************************************************************/
/* DashTopCustomerGroups: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTopCustomerGroups.onCreated(function () {

    let instance = this;
    instance.topCustomerGroupsFilter = new ReactiveVar('Year');
    instance.topCustomerGroups = new ReactiveDict();
    instance.topCustomerGroups.set('showLoading', true);
    instance.getGroupNames = function (groups) {
        return _.pluck(groups, 'name');
    };
    instance.getGroupTotalAmounts = function (topCustomerGroups) {
        return _.pluck(topCustomerGroups, 'totalAmount');
    };

    instance.autorun(function () {
        instance.topCustomerGroups.set('showLoading', true);
        Meteor.call('customergroups/topCustomerGroups', instance.topCustomerGroupsFilter.get(), function (error, data) {
            instance.topCustomerGroups.set('showLoading', false);
            var barChartData = {
                labels : instance.getGroupNames(data.currentTopCustomerGroups),
                datasets : [
                    {
                        fillColor : "rgba(48,145,213,1)",
                        strokeColor : "rgba(151,187,205,0.8)",
                        highlightFill : "rgba(48,145,213,0.5)",
                        highlightStroke : "rgba(151,187,205,1)",
                        data : instance.getGroupTotalAmounts(data.currentTopCustomerGroups)
                    }
                ]
            };
            var ctx = document.getElementById("hbChart").getContext("2d");
            let currency = Core.getTenantBaseCurrency();
            if (currency){
                currency = currency.symbol ? currency.symbol  : currency.iso;
            }
            currency = currency ? currency : "";
            var chart = new Chart(ctx).HorizontalBar(barChartData, {
                responsive: true,
                barShowStroke: false,
                scaleLabel:
                    function(label){return  currency + label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");},
                tooltipTemplate:
                    function(label){return  currency + label.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");}
            });
        });
    });

});

Template.DashTopCustomerGroups.onRendered(function () {
});

Template.DashTopCustomerGroups.onDestroyed(function () {
});

