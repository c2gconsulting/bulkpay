/*****************************************************************************/
/* DashTopDistributors: Event Handlers */
/*****************************************************************************/
Template.DashTopDistributors.events({
    'click a[href="#annually"]': function (e, tmpl) {
        tmpl.topCustomersFilter.set('Year');
    },

    'click a[href="#month"]': function (e, tmpl) {
        tmpl.topCustomersFilter.set('Month');
    },

    'click a[href="#week"]': function (e, tmpl) {
        tmpl.topCustomersFilter.set('Week');
    },

    'click a[href="#today"]': function (e, tmpl) {
        tmpl.topCustomersFilter.set('Today');
    }
});

/*****************************************************************************/
/* DashTopDistributors: Helpers */
/*****************************************************************************/
Template.DashTopDistributors.helpers({
    topCustomers: function () {
        let current, previous;
        if (Template.instance().topCustomers.get('topCustomers') && Template.instance().topCustomers.get('topCustomers')) {
            current = Template.instance().topCustomers.get('topCustomers').currentTopCustomers;
            previous = Template.instance().topCustomers.get('topCustomers').previousTopCustomers;
            return transform(current, previous);
        }
        return [];
    },
    topCustomerFilter: function () {
        return Template.instance().topCustomersFilter.get();
    },
    enableLoading: function () {
        return  Template.instance().topCustomers.get('showLoading');
    }
});

/*****************************************************************************/
/* DashTopDistributors: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTopDistributors.onCreated(function () {

    let instance = this;
    instance.topCustomers = new ReactiveDict();
    instance.topCustomersFilter = new ReactiveVar('Year');
    instance.topCustomers.set('showLoading', true);

    instance.autorun(function () {
        instance.topCustomers.set('showLoading', true);
        Meteor.call('orders/topCustomers', instance.topCustomersFilter.get(), function (error, data) {
            if (error){
                console.log(error)
            } else {
                instance.topCustomers.set('topCustomers', data);
                instance.topCustomers.set('showLoading', false);
            }
        });
    });
});

Template.DashTopDistributors.onRendered(function () {
});

Template.DashTopDistributors.onDestroyed(function () {
});


let transform = function (current, previous) {
    _.each(current, function (customer, index) {
        let oldNum = (index <= previous.length - 1) ? previous[index].totalAmount : 0;
        let newNum = customer.totalAmount;
        let evaluatedPercentage;
        if (oldNum) {
            evaluatedPercentage = (((newNum - oldNum) / ( oldNum )) * 100).toFixed(0);
            customer.evaluatedPercentage = Number(evaluatedPercentage);
            customer.percentageChange = customer.evaluatedPercentage > 0;
        }
    });
    return current;
};