/*****************************************************************************/
/* DashTopProducts: Event Handlers */
/*****************************************************************************/
Template.DashTopProducts.events({
    'click a[href="#annually"]': function (e, tmpl) {
        tmpl.topLocationsFilter.set('Year');
    },

    'click a[href="#month"]': function (e, tmpl) {
        tmpl.topLocationsFilter.set('Month');
    },

    'click a[href="#week"]': function (e, tmpl) {
        tmpl.topLocationsFilter.set('Week');
    },

    'click a[href="#today"]': function (e, tmpl) {
        tmpl.topLocationsFilter.set('Today');
    }
});

/*****************************************************************************/
/* DashTopProducts: Helpers */
/*****************************************************************************/
Template.DashTopProducts.helpers({
    topLocations: function () {
        let current, previous;
        if (Template.instance().topLocations.get('topLocations') && Template.instance().topLocations.get('topLocations')) {
            current = Template.instance().topLocations.get('topLocations').currentTopLocations;
            previous = Template.instance().topLocations.get('topLocations').previousTopLocations;
            return transform(current, previous);
        }
        return [];
    },
    topLocationsFilter: function () {
        return Template.instance().topLocationsFilter.get();
    },
    enableLoading: function () {
        return  Template.instance().topLocations.get('showLoading');
    }
});

/*****************************************************************************/
/* DashTopProducts: Lifecycle Hooks */
/*****************************************************************************/
Template.DashTopProducts.onCreated(function () {
    let instance = this;
    instance.topLocations = new ReactiveDict();
    instance.topLocationsFilter = new ReactiveVar('Year');
    instance.topLocations.set('showLoading', true);

    instance.autorun(function () {
        instance.topLocations.set('showLoading', true);
        Meteor.call('locations/topLocations', instance.topLocationsFilter.get(), function (error, data) {
            if (error){
                console.log(error)
            } else {
                instance.topLocations.set('topLocations', data);
                instance.topLocations.set('showLoading', false);
            }
        });
    });
});

Template.DashTopProducts.onRendered(function () {
});

Template.DashTopProducts.onDestroyed(function () {
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
